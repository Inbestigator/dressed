import { config } from "@dotenvx/dotenvx";
config();
import setupCommands from "./bot/commands.ts";
import ora from "ora";
import setupComponents from "./bot/components.ts";
import { env } from "node:process";
import type {
  CommandInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "../internal/types/interaction.ts";
import type { Command, Component } from "../internal/types/config.ts";

/**
 * Create the command and component handlers.
 */
export async function createHandlers(
  commands: Omit<Command, "default">[],
  components: Omit<Component, "default">[],
): Promise<{
  runCommand: (interaction: CommandInteraction) => Promise<void>;
  runComponent: (
    interaction: MessageComponentInteraction | ModalSubmitInteraction,
  ) => Promise<void>;
}> {
  const initLoader = ora("Initializing").start();

  if (!env.DISCORD_TOKEN) {
    initLoader.fail();
    throw new Error(
      "No bot token provided, make sure to provide a TOKEN environment variable",
    );
  }

  initLoader.succeed();

  const runCommand = await setupCommands(commands);
  const runComponent = setupComponents(components);

  return {
    runCommand,
    runComponent,
  };
}
