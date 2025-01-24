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
  BotConfig,
  CommandHandler,
  ComponentHandler,
} from "../internal/types/config.ts";
import Fastify from "fastify";

/**
 * Start serving a Fastify server
 */
export function createServer(
  runCommand: CommandHandler,
  runComponent: ComponentHandler,
  config: BotConfig,
) {
  const fastify = Fastify();

  fastify.post(config.endpoint ?? "/", (req, res) => {
    const reqLoader = ora("Validating new request").start();

    if (
      !(verifySignature(
        JSON.stringify(req.body),
        req.headers["x-signature-ed25519"],
        req.headers["x-signature-timestamp"],
      ))
    ) {
      reqLoader.fail();
      console.error(" └ Invalid signature");
      res.status(401);
      return;
    }

    reqLoader.succeed("Validated request");

    try {
      const status = runInteraction(
        runCommand,
        runComponent,
        req.body,
      );

      if (status === 200) {
        return { type: 1 };
      }
      res.status(status);
    } catch (error) {
      console.error(" └ Error processing request:", error);
      res.status(500);
    }
  });

  fastify.listen({ port: config.port ?? 8000 }, (_, port) => {
    console.log(`Bot is now listening on ${port}`);
  });
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
