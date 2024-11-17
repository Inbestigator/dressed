import { config } from "@dotenvx/dotenvx";
config();
import setupCommands from "./bot/commands.ts";
import ora from "ora";
import setupComponents from "./bot/components.ts";
import getDetails from "../internal/details.ts";
import { env } from "node:process";
import type { WalkEntry } from "./build.ts";
import type {
  CommandInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "../internal/types/interaction.ts";

/**
 * Creates a new instance of your bot.
 */
export async function createInstance(
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

  const details = await getDetails();

  ora(`Logged in as ${details.username}`).succeed();

  const runCommand = await setupCommands(commandFiles);

  const runComponent = await setupComponents(componentFiles);

  return {
    runCommand,
    runComponent,
  };
}
