import { config } from "@dotenvx/dotenvx";
config();
import setupCommands from "./bot/commands.ts";
import loader from "../internal/loader.ts";
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
  const initLoader = loader("Initializing");

  if (!env.DISCORD_TOKEN) {
    initLoader.error();
    throw new Error(
      "No bot token provided, make sure to provide a TOKEN environment variable",
    );
  }

  initLoader.resolve();

  const details = await getDetails();

  loader(`Logged in as ${details.username}`).resolve();

  const runCommand = await setupCommands(commandFiles);

  const runComponent = await setupComponents(componentFiles);

  return {
    runCommand,
    runComponent,
  };
}
