import ora from "ora";
import { verifySignature } from "./signature.ts";
import {
  type APIApplicationCommandInteraction,
  type APIMessageComponentInteraction,
  type APIModalSubmitInteraction,
  type APIWebhookEventBody,
  ApplicationWebhookType,
  InteractionType,
} from "discord-api-types/v10";
import createInteraction from "./interaction.ts";
import type {
  CommandHandler,
  ComponentHandler,
  EventHandler,
  ServerConfig,
} from "../types/config.ts";
import { createServer as createHttpServer, type Server } from "node:http";
import { stdout } from "node:process";
import { Buffer } from "node:buffer";

/**
 * Starts a server to handle interactions.
 * @returns The server instance
 */
export function createServer(
  runCommand: CommandHandler,
  runComponent: ComponentHandler,
  runEvent: EventHandler,
  config: ServerConfig,
): Server {
  const server = createHttpServer((req, res) => {
    if (req.url !== (config.endpoint ?? "/")) {
      res.statusCode = 404;
      res.end();
      return;
    } else if (req.method !== "POST") {
      res.statusCode = 405;
      res.end();
      return;
    }

    const chunks: Uint8Array[] = [];
    req
      .on("data", (c) => chunks.push(c))
      .on("end", async () => {
        const handlerRes = await handleRequest(
          new Request("http://localhost", {
            method: "POST",
            body: Buffer.concat(chunks),
            headers: req.headers as unknown as Headers,
          }),
          runCommand,
          runComponent,
          runEvent,
        );

        res.statusCode = handlerRes.status;
        res.setHeader("Content-Type", "application/json");
        res.end(handlerRes.status === 200 ? '{"type":1}' : null);
      });
  });

  const port = config.port ?? 8000;

  server.listen(port, "localhost", () => {
    console.log(
      `Bot is now listening on ${new URL(config.endpoint ?? "", `http://localhost:${port}`).href}`,
    );
  });

  return server;
}

/**
 * Handles a request from Discord.
 * @param req The request from Discord
 * @param runCommand The function to run a command
 * @param runComponent The function to run a component
 * @returns The response to send back to Discord
 */
export async function handleRequest(
  req: Request,
  runCommand: CommandHandler,
  runComponent: ComponentHandler,
  runEvent: EventHandler,
): Promise<Response> {
  const reqLoader = ora({
    stream: stdout,
    text: "Validating new request",
  }).start();
  const body = await req.text();

  if (
    !verifySignature(
      body,
      req.headers.get("x-signature-ed25519"),
      req.headers.get("x-signature-timestamp"),
    )
  ) {
    reqLoader.fail("Invalid signature");
    return new Response(null, { status: 401 });
  }

  reqLoader.succeed("Validated request");

  try {
    const json = JSON.parse(body);
    let status = 500;
    if ("token" in json) {
      // The interaction response token
      status = handleInteraction(runCommand, runComponent, json);
    } else {
      status = handleEvent(runEvent, json);
    }
    return new Response(status === 200 ? '{"type":1}' : null, {
      status,
    });
  } catch (error) {
    console.error("└ Error processing request:", error);
    return new Response(null, { status: 500 });
  }
}

/**
 * Runs an interaction, takes functions to run commands/components and the request body
 */
export function handleInteraction(
  runCommand: CommandHandler,
  runComponent: ComponentHandler,
  json: ReturnType<typeof JSON.parse>,
): 200 | 202 | 404 {
  switch (json.type) {
    case InteractionType.Ping: {
      console.log("Received ping test");
      return 200;
    }
    case InteractionType.ApplicationCommand: {
      const command = json as APIApplicationCommandInteraction;
      const interaction = createInteraction(command);
      runCommand(interaction);
      return 202;
    }
    case InteractionType.MessageComponent:
    case InteractionType.ModalSubmit: {
      const component = json as
        | APIMessageComponentInteraction
        | APIModalSubmitInteraction;
      const interaction = createInteraction(component);
      runComponent(interaction);
      return 202;
    }
    default: {
      console.error("Received unknown interaction type:", json.type);
      return 404;
    }
  }
}

/**
 * Runs an event, takes a function to run events and the request body
 */
export function handleEvent(
  runEvent: EventHandler,
  json: ReturnType<typeof JSON.parse>,
): 200 | 202 | 404 {
  switch (json.type) {
    case ApplicationWebhookType.Ping: {
      console.log("Received ping test");
      return 200;
    }
    case ApplicationWebhookType.Event: {
      const event = json.event as APIWebhookEventBody;
      runEvent(event);
      return 202;
    }
    default: {
      console.log("Received unknown event type:", json.type);
      return 404;
    }
  }
}
