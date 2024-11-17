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
  CommandInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "../internal/types/interaction.ts";
import type { BotConfig } from "../internal/types/config.ts";

/**
 * Start serving a server
 */
export function createServer(
  runCommand: (interaction: CommandInteraction) => Promise<void>,
  runComponent: (
    interaction: MessageComponentInteraction | ModalSubmitInteraction,
  ) => Promise<void>,
  config: BotConfig,
) {
  Deno.serve(async (req) => {
    const reqLoader = ora(`New request`).start();
    if (!(await verifySignature(req.clone()))) {
      reqLoader.fail();
      console.error(" └ Invalid signature");
      return new Response("Unauthorized", { status: 401 });
    }

    if (
      req.method !== "POST" ||
      new URL(req.url).pathname !== (config.endpoint ?? "/")
    ) {
      return new Response("Not Found", { status: 404 });
    }

    reqLoader.succeed();
    return await runInteraction(runCommand, runComponent, req);
  });
}

/**
 * Runs an interaction, takes a function to run commands/components and the entry request
 */
export async function runInteraction(
  runCommand: (interaction: CommandInteraction) => Promise<void>,
  runComponent: (
    interaction: MessageComponentInteraction | ModalSubmitInteraction,
  ) => Promise<void>,
  req: Request,
): Promise<Response> {
  const json = await req.json();
  switch (json.type) {
    case InteractionType.Ping: {
      console.log(" └ Received ping test");
      return new Response(JSON.stringify({ type: 1 }), { status: 200 });
    }
    case InteractionType.ApplicationCommand: {
      const command = json as APIApplicationCommandInteraction;
      console.log(" ├ Received application command interaction");
      console.log(" └ Command:", command.data.name);
      const interaction = createInteraction(command);

      await runCommand(interaction);
      return new Response(null, { status: 204 });
    }
    case InteractionType.MessageComponent: {
      const component = json as APIMessageComponentInteraction;
      console.log(" ├ Received message component interaction");
      console.log(" └ Component:", component.data.custom_id);
      const interaction = createInteraction(component);

      await runComponent(interaction);
      return new Response(null, { status: 204 });
    }
    case InteractionType.ModalSubmit: {
      const component = json as APIModalSubmitInteraction;
      console.log(" ├ Received modal submit interaction");
      console.log(" └ Modal:", component.data.custom_id);
      const interaction = createInteraction(component);

      await runComponent(interaction);
      return new Response(null, { status: 204 });
    }
  }

  return new Response(null, { status: 404 });
}
