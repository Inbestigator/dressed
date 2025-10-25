import { createServer as createHttpServer, type Server } from "node:http";
import {
  type APIApplicationCommandAutocompleteInteraction,
  type APIApplicationCommandInteraction,
  type APIMessageComponentInteraction,
  type APIModalSubmitInteraction,
  type APIWebhookEventBody,
  ApplicationWebhookType,
  InteractionType,
} from "discord-api-types/v10";
import type { CommandData, ComponentData, EventData, ServerConfig } from "../types/config.ts";
import type { CommandRunner, ComponentRunner, EventRunner } from "../types/handlers.ts";
import { logError, logSuccess } from "../utils/log.ts";
import { override } from "../utils/override-obj.ts";
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
  config = override(globalThis.DRESSED_CONFIG, config);
  const endpoint = new URL(config.endpoint ?? "/", `http://localhost:${config.port ?? 8000}`);
  const server = createHttpServer(async (req, res) => {
    if (req.url !== endpoint.pathname) {
      return res.writeHead(404).end();
    } else if (req.method !== "POST") {
      return res.writeHead(405).end();
    }

    const handlerRes = await handleRequest(
      new Request(endpoint, {
        method: "POST",
        // @ts-expect-error Headers will init from an object, the type is just weird
        headers: req.headers,
        // @ts-expect-error The node:http req reads to a body
        body: req,
        duplex: "half", // Undici throws if this isn't present when body is a stream -inb
      }),
      commands,
      components,
      events,
      config,
    );

    res.writeHead(handlerRes.status, { "Content-Type": "application/json" }).end(await handlerRes.text());
  });

  const port = config.port ?? 8000;
  const shutdown = () => server.close(() => process.exit());

  server.listen(port, "0.0.0.0", () => logSuccess("Bot is now listening on", endpoint.href));

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  return server;
}

/**
 * Handles a request from Discord.
 * @param req The request from Discord
 * @param commands A list of commands or the function to run a command
 * @param components A list of components or the function to run a component
 * @param events A list of events or the function to run an event
 * @param config Configuration for your server
 * @returns The response to send back to Discord
 */
export async function handleRequest(
  req: Request,
  commands: CommandRunner | CommandData[],
  components: ComponentRunner | ComponentData[],
  events: EventRunner | EventData[],
  config = globalThis.DRESSED_CONFIG,
): Promise<Response> {
  const body = await req.text();
  const verified = await verifySignature(
    body,
    req.headers.get("x-signature-ed25519") as string,
    req.headers.get("x-signature-timestamp") as string,
  );

  if (!verified) {
    logError("Invalid signature");
    return new Response(null, { status: 401 });
  }

  try {
    const json = JSON.parse(body);
    let status = 500;
    // The interaction response token
    if ("token" in json) {
      status = await handleInteraction(commands, components, json, config.middleware);
    } else {
      status = await handleEvent(events, json, config.middleware);
    }
    return new Response(status === 200 ? '{"type":1}' : null, {
      status,
    });
  } catch (error) {
    logError("Failed to process request:", error);
    return new Response(null, { status: 500 });
  }
}

/**
 * Runs an interaction, takes functions to run commands/components/middleware and the request body
 */
export async function handleInteraction(
  commands: CommandRunner | CommandData[],
  components: ComponentRunner | ComponentData[],
  json: ReturnType<typeof JSON.parse>,
  middleware: ServerConfig["middleware"],
): Promise<200 | 202 | 404> {
  switch (json.type) {
    case InteractionType.Ping: {
      logSuccess("Received ping test");
      return 200;
    }
    case InteractionType.ApplicationCommand: {
      const interaction = createInteraction(json as APIApplicationCommandInteraction);
      const runCommand = typeof commands === "function" ? commands : setupCommands(commands);
      await runCommand(interaction, middleware?.commands as Parameters<typeof runCommand>[1]);
      return 202;
    }
    case InteractionType.ApplicationCommandAutocomplete: {
      const interaction = createInteraction(json as APIApplicationCommandAutocompleteInteraction);
      const runCommand = typeof commands === "function" ? commands : setupCommands(commands);
      await runCommand(interaction, undefined, "autocomplete");
      return 202;
    }
    case InteractionType.MessageComponent:
    case InteractionType.ModalSubmit: {
      const interaction = createInteraction(json as APIMessageComponentInteraction | APIModalSubmitInteraction);
      const runComponent = typeof components === "function" ? components : setupComponents(components);
      await runComponent(interaction, middleware?.components);
      return 202;
    }
    default: {
      logError("Received unknown interaction type:", json.type);
      return 404;
    }
  }
}

/**
 * Runs an event, takes a function to run events/middleware and the request body
 */
export async function handleEvent(
  events: EventRunner | EventData[],
  json: ReturnType<typeof JSON.parse>,
  middleware: ServerConfig["middleware"],
): Promise<200 | 202 | 404> {
  switch (json.type) {
    case ApplicationWebhookType.Ping: {
      logSuccess("Received ping test");
      return 200;
    }
    case ApplicationWebhookType.Event: {
      const runEvent = typeof events === "function" ? events : setupEvents(events);
      await runEvent(json.event as APIWebhookEventBody, middleware?.events);
      return 202;
    }
    default: {
      logError("Received unknown event type:", json.type);
      return 404;
    }
  }
}
