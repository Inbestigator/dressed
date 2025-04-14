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
import fastify, { type FastifyInstance } from "fastify";

/**
 * Starts a [Fastify](https://fastify.dev/) server to handle interactions.
 * @returns The Fastify server instance
 */
export function createServer(
  runCommand: CommandHandler,
  runComponent: ComponentHandler,
  config: ServerConfig,
): FastifyInstance {
  const instance = fastify();

  instance.post(config.endpoint ?? "/", (req, res) => {
    const handlerRes = handleRequest(
      {
        text: JSON.stringify(req.body),
        headers: {
          "x-signature-ed25519": req.headers["x-signature-ed25519"],
          "x-signature-timestamp": req.headers["x-signature-timestamp"],
        },
      },
      runCommand,
      runComponent,
    );

    res.status(handlerRes.status).send(handlerRes.body);
  });

  instance.listen({ port: config.port ?? 8000 }, (_, port) => {
    console.log(`Bot is now listening on ${port}`);
  });

  return instance;
}

/**
 * Handles a request from Discord.
 * @param req The request from Discord
 * @param runCommand The function to run a command
 * @param runComponent The function to run a component
 * @returns The response to send back to Discord
 */
export function handleRequest(
  req: {
    text: string;
    headers: {
      "x-signature-ed25519"?: string | string[] | null;
      "x-signature-timestamp"?: string | string[] | null;
    };
  },
  runCommand: CommandHandler,
  runComponent: ComponentHandler,
): Response {
  const reqLoader = ora("Validating new request").start();

  if (
    !(verifySignature(
      req.text,
      req.headers["x-signature-ed25519"],
      req.headers["x-signature-timestamp"],
    ))
  ) {
    reqLoader.fail();
    console.error(" └ Invalid signature");
    return new Response(null, { status: 401 });
  }

  reqLoader.succeed("Validated request");

  try {
    const status = runInteraction(
      runCommand,
      runComponent,
      JSON.parse(req.text),
    );
    return new Response(status === 200 ? '{"type":1}' : null, {
      status,
    });
  } catch (error) {
    console.error(" └ Error processing request:", error);
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
