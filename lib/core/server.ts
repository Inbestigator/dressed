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
import { handle } from "@http/route/handle";
import { byPattern } from "@http/route/by-pattern";
import { byMethod } from "@http/route/by-method";

/**
 * Start serving a Deno server
 */
export function createServer(
  runCommand: CommandHandler,
  runComponent: ComponentHandler,
  config: BotConfig,
) {
  Deno.serve(handle([
    byPattern(
      config.endpoint ?? "/",
      byMethod({
        POST: async (req) => {
          const reqLoader = ora("New request").start();
          if (!(await verifySignature(req))) {
            reqLoader.fail();
            console.error("└ Invalid signature");
            return new Response("Unauthorized", { status: 401 });
          }

          reqLoader.stopAndPersist({
            symbol: "┌",
          });
          return await runInteraction(runCommand, runComponent, req);
        },
      }),
    ),
  ]));
}

/**
 * Runs an interaction, takes a function to run commands/components and the entry request
 */
export async function runInteraction(
  runCommand: CommandHandler,
  runComponent: ComponentHandler,
  req: Request,
): Promise<Response> {
  const json = await req.json();
  switch (json.type) {
    case InteractionType.Ping: {
      console.log("└ Received ping test");
      return new Response(JSON.stringify({ type: 1 }), { status: 200 });
    }
    case InteractionType.ApplicationCommand: {
      const command = json as APIApplicationCommandInteraction;
      console.log("└ Received command:", command.data.name);
      const interaction = createInteraction(command);

      await runCommand(interaction);
      return new Response(null, { status: 204 });
    }
    case InteractionType.MessageComponent: {
      const component = json as APIMessageComponentInteraction;
      console.log("└ Received component:", component.data.custom_id);
      const interaction = createInteraction(component);

      await runComponent(interaction);
      return new Response(null, { status: 204 });
    }
    case InteractionType.ModalSubmit: {
      const component = json as APIModalSubmitInteraction;
      console.log("└ Received modal:", component.data.custom_id);
      const interaction = createInteraction(component);

      await runComponent(interaction);
      return new Response(null, { status: 204 });
    }
  }

  return new Response(null, { status: 404 });
}
