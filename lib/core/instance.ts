import "@std/dotenv/load";
import setupCommands from "./bot/commands.ts";
import loader from "../internal/loader.ts";
import type { BotConfig } from "../internal/types/config.ts";
import setupComponents from "./bot/components.ts";
import getDetails from "../internal/details.ts";
import createServer from "./server.ts";
import type { WalkEntry } from "@std/fs/walk";
import { fetchConfig } from "./build.ts";

/**
 * Creates a new instance of your bot.
 */
export async function createInstance(
  config?: BotConfig,
  commandFiles?: WalkEntry[],
  componentFiles?: WalkEntry[],
) {
  const initLoader = loader("Initializing");

  if (!config) {
    config = await fetchConfig();
  }

  if (!config) {
    await initLoader.error();
    throw new Error("No bot config found");
  }

  if (!Deno.env.get("DISCORD_TOKEN")) {
    await initLoader.error();
    throw new Error(
      "No bot token provided, make sure to provide a TOKEN environment variable",
    );
  }

  await initLoader.resolve();

  const details = await getDetails();

  loader(`Logged in as ${details.username}`).resolve();

  const runCommand = await setupCommands(commandFiles);

  const runComponent = await setupComponents(componentFiles);

  createServer(runCommand, runComponent, config);
}
