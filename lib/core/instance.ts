import "@std/dotenv/load";
import setupCommands from "./bot/commands.ts";
import loader from "../internal/loader.ts";
import type { BotConfig } from "../internal/types/config.ts";
import { join } from "node:path";
import setupComponents from "./bot/components.ts";
import getDetails from "../internal/details.ts";
import createServer from "./server.ts";

/**
 * Creates a new instance of your bot.
 */
export async function createInstance() {
  const initLoader = loader("Initializing");

  const config = await fetchConfig();

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

  const runCommand = await setupCommands();
  const runComponent = await setupComponents();

  createServer(runCommand, runComponent, config);

  async function fetchConfig(): Promise<BotConfig | null> {
    const configPath = join("file://", Deno.cwd(), "bot.config.ts");

    try {
      const configModule = await import(configPath);
      const config = configModule.default;
      if (!config) {
        throw new Error("Config not found in bot.config.ts");
      }
      return config;
    } catch (error) {
      console.error("Error loading bot.config.ts:", error);
      return null;
    }
  }
}
