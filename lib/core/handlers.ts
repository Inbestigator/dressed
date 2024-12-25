import { config } from "@dotenvx/dotenvx";
config();
import setupCommands from "./bot/commands.ts";
import ora from "ora";
import setupComponents from "./bot/components.ts";
import { env } from "node:process";
import type { WalkEntry } from "./build.ts";
import type {
  CommandInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "../internal/types/interaction.ts";

/**
 * Create the command and component handlers.
 */
export async function createHandlers(
  commandFiles?: WalkEntry[],
  componentFiles?: WalkEntry[],
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

  const runCommand = await setupCommands(commandFiles);
  const runComponent = await setupComponents(componentFiles);

  return {
    runCommand,
    runComponent,
  };
}
