import "@std/dotenv/load";
import setupCommands from "./bot/commands.ts";
import loader from "../internal/loader.ts";
import type { BotConfig } from "../internal/types/config.ts";
import setupComponents from "./bot/components.ts";
import getDetails from "../internal/details.ts";
import createServer from "./server.ts";
import type { WalkEntry } from "@std/fs/walk";
import { fetchConfig } from "./build.ts";
import { env } from "node:process";

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
    initLoader.error();
    throw new Error("No bot config found");
  }

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

  createServer(runCommand, runComponent, config);
}
