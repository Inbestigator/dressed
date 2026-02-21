import { createServer as createHttpServer, type Server } from "node:http";
import {
  type APIInteraction,
  type APIWebhookEvent,
  ApplicationWebhookType,
  InteractionType,
} from "discord-api-types/v10";
import type { CommandData, ComponentData, EventData, ServerConfig } from "../types/config.ts";
import type { CommandRunner, ComponentRunner, EventRunner } from "../types/handlers.ts";
import { config as dressedConfig } from "../utils/env.ts";
import logger from "../utils/log.ts";
import { createInteraction } from "./extenders/interaction.ts";
import { setupCommands } from "./handlers/commands.ts";
import { setupComponents } from "./handlers/components.ts";
import { setupEvents } from "./handlers/events.ts";
import { verifySignature } from "./signature.ts";

/**
 * Starts a server to handle interactions.
 * @returns The server instance
 */
export function createServer(
  commands: CommandRunner | CommandData[],
  components: ComponentRunner | ComponentData[],
  events: EventRunner | EventData[],
  config: ServerConfig = {},
): Server {
  config = override(dressedConfig.server ?? {}, config);
  const port = config.port ?? 8000;
  const endpoint = new URL(config.endpoint ?? "/", `http://localhost:${port}`);
  const server = createHttpServer(async (req, res) => {
    if (req.url !== endpoint.pathname) {
      return res.writeHead(404).end();
    } else if (req.method !== "POST") {
      return res.writeHead(405).end();
    }

    const stdReq = new Request(endpoint, {
      method: "POST",
      // @ts-expect-error Headers will init from an object, the type is just weird
      headers: req.headers,
      // @ts-expect-error The node:http req reads to a body
      body: req,
      duplex: "half", // Undici throws if this isn't present when body is a stream -inb
    });

    dressedConfig.observability?.onServerRequest?.(stdReq);

    const handlerRes = await handleRequest(stdReq, commands, components, events);

    dressedConfig.observability?.onServerResponded?.(handlerRes);

    res.writeHead(handlerRes.status, { "Content-Type": "application/json" }).end(await handlerRes.text());
  });

  server.listen(port, "0.0.0.0", () => logger.succeed("Bot is now listening on", endpoint.href));

  const shutdown = () => server.close(() => process.exit());
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  return server;
}

/**
 * Handles a request from Discord.
 * @param req The incoming request
 * @param commands A list of commands or the function to run a command
 * @param components A list of components or the function to run a component
 * @param events A list of events or the function to run an event
 * @returns The response to send back
 */
export async function handleRequest(
  req: Request,
  commands: CommandRunner | CommandData[],
  components: ComponentRunner | ComponentData[],
  events: EventRunner | EventData[],
): Promise<Response> {
  const body = await req.text();
  const verified = await verifySignature(
    body,
    req.headers.get("x-signature-ed25519") as string,
    req.headers.get("x-signature-timestamp") as string,
  );

  if (!verified) {
    logger.error(new Error("Invalid signature"));
    return new Response(null, { status: 401 });
  }

  try {
    const json = JSON.parse(body);
    let status: number;
    // The interaction response token
    if ("token" in json) {
      status = await handleInteraction(commands, components, json);
    } else {
      status = await handleEvent(events, json);
    }
    return new Response(status === 200 ? '{"type":1}' : null, { status });
  } catch (error) {
    logger.error(new Error("Failed to process request", { cause: error }));
    return new Response(null, { status: 500 });
  }
}

/**
 * Runs an interaction, takes functions to run commands/components and the interaction body.
 */
export async function handleInteraction(
  commands: CommandRunner | CommandData[],
  components: ComponentRunner | ComponentData[],
  interaction: APIInteraction,
): Promise<200 | 202 | 404> {
  dressedConfig.observability?.onServerInteraction?.(interaction);
  switch (interaction.type) {
    case InteractionType.Ping: {
      logger.succeed("Received ping test");
      return 200;
    }
    case InteractionType.ApplicationCommand: {
      const runCommand = typeof commands === "function" ? commands : setupCommands(commands);
      await runCommand(createInteraction(interaction), dressedConfig.observability?.onBeforeCommand as never);
      return 202;
    }
    case InteractionType.ApplicationCommandAutocomplete: {
      const runCommand = typeof commands === "function" ? commands : setupCommands(commands);
      await runCommand(createInteraction(interaction), undefined, "autocomplete");
      return 202;
    }
    case InteractionType.MessageComponent:
    case InteractionType.ModalSubmit: {
      const runComponent = typeof components === "function" ? components : setupComponents(components);
      await runComponent(createInteraction(interaction), dressedConfig.observability?.onBeforeComponent);
      return 202;
    }
    default: {
      logger.error(new Error("Received invalid interaction", { cause: interaction }));
      return 404;
    }
  }
}

/**
 * Runs an event, takes a function to run events and the event body.
 */
export async function handleEvent(events: EventRunner | EventData[], event: APIWebhookEvent): Promise<200 | 202 | 404> {
  dressedConfig.observability?.onServerEvent?.(event);
  switch (event.type) {
    case ApplicationWebhookType.Ping: {
      logger.succeed("Received ping test");
      return 200;
    }
    case ApplicationWebhookType.Event: {
      const runEvent = typeof events === "function" ? events : setupEvents(events);
      await runEvent(event.event, dressedConfig.observability?.onBeforeEvent);
      return 202;
    }
    default: {
      logger.error(new Error("Received invalid event", { cause: event }));
      return 404;
    }
  }
}

/** Deep merges two objects, producing a new object where values from {@link b} override those from {@link a}. */
function override<T>(a: Partial<T>, b: Partial<T>) {
  const result = { ...a };

  for (const key in b) {
    const k = key as keyof T;
    const bv = b[k];
    const av = a[k];

    if (bv !== undefined && typeof bv === "object" && bv !== null && !Array.isArray(bv)) {
      result[k] = override(av ?? {}, bv) as T[typeof k];
    } else if (bv !== undefined) {
      result[k] = bv as T[typeof k];
    }
  }

  return result;
}
