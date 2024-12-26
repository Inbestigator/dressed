import { config } from "@dotenvx/dotenvx";
config();
import setupCommands from "./bot/commands.ts";
import ora from "ora";
import setupComponents from "./bot/components.ts";
import { env } from "node:process";
import type {
  Command,
  CommandHandler,
  Component,
  ComponentHandler,
} from "../internal/types/config.ts";

/**
 * Create the command and component handlers.
 */
export async function createHandlers(
  commands: Command[],
  components: Component[],
): Promise<{
  runCommand: CommandHandler;
  runComponent: ComponentHandler;
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
