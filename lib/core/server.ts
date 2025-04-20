import { config } from "dotenv";
config();
import ora from "ora";
import { verifySignature } from "../internal/utils.ts";
import {
  type APIApplicationCommandInteraction,
  type APIMessageComponentInteraction,
  type APIModalSubmitInteraction,
  InteractionType,
} from "discord-api-types/v10";
import createInteraction from "../internal/interaction.ts";
import type {
  CommandHandler,
  ComponentHandler,
  ServerConfig,
} from "../internal/types/config.ts";
import { createServer as createHttpServer, type Server } from "node:http";
import { stdout } from "node:process";

/**
 * Starts a server to handle interactions.
 * @returns The server instance
 */
export function createServer(
  runCommand: CommandHandler,
  runComponent: ComponentHandler,
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

    const body: Uint8Array<ArrayBufferLike>[] = [];
    req
      .on("data", (c) => body.push(c))
      .on("end", async () => {
        const handlerRes = await handleRequest(
          new Request("http://localhost", {
            method: "POST",
            body,
            headers: req.headers as unknown as Headers,
          }),
          runCommand,
          runComponent,
        );

        res.statusCode = handlerRes.status;
        res.setHeader("Content-Type", "application/json");
        res.end(handlerRes.status === 200 ? '{"type":1}' : null);
      });
  });

  const port = config.port ?? 8000;

  server.listen(port, "localhost", () => {
    console.log(`Bot is now listening on http://localhost:${port}`);
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
): Promise<Response> {
  const reqLoader = ora({
    stream: stdout,
    text: "Validating new request",
  })
    .start();
  const body = await req.text();

  if (
    !(verifySignature(
      body,
      req.headers.get("x-signature-ed25519"),
      req.headers.get("x-signature-timestamp"),
    ))
  ) {
    reqLoader.fail();
    console.error("└ Invalid signature");
    return new Response(null, { status: 401 });
  }

  reqLoader.succeed("Validated request");

  try {
    const status = runInteraction(
      runCommand,
      runComponent,
      JSON.parse(body),
    );
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
export function runInteraction(
  runCommand: CommandHandler,
  runComponent: ComponentHandler,
  json: ReturnType<typeof JSON.parse>,
): 200 | 202 | 404 {
  switch (json.type) {
    case InteractionType.Ping: {
      console.log("└ Received ping test");
      return 200;
    }
    case InteractionType.ApplicationCommand: {
      const command = json as APIApplicationCommandInteraction;
      console.log("└ Received command:", command.data.name);
      const interaction = createInteraction(command);
      runCommand(interaction);
      return 202;
    }
    case InteractionType.MessageComponent: {
      const component = json as APIMessageComponentInteraction;
      console.log("└ Received component:", component.data.custom_id);
      const interaction = createInteraction(component);
      runComponent(interaction);
      return 202;
    }
    case InteractionType.ModalSubmit: {
      const component = json as APIModalSubmitInteraction;
      console.log("└ Received modal:", component.data.custom_id);
      const interaction = createInteraction(component);
      runComponent(interaction);
      return 202;
    }
    default: {
      console.log("└ Received unknown interaction type:", json.type);
      return 404;
    }
  }
}
