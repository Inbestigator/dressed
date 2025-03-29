import { config } from "dotenv";
config();
import setupCommands from "./bot/commands.ts";
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
export function createHandlers(
  commands: Command[],
  components: Component[],
): {
  runCommand: CommandHandler;
  runComponent: ComponentHandler;
} {
  if (!env.DISCORD_TOKEN) {
    throw new Error(
      "No bot token provided, make sure to provide a DISCORD_TOKEN environment variable",
    );
  }

  const runCommand = setupCommands(commands);
  const runComponent = setupComponents(components);

  return {
    runCommand,
    runComponent,
  };
}
