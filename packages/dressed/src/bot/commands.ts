import type { CommandData, CommandHandler } from "../types/config.ts";
import ora from "ora";
import { trackParts, type WalkEntry } from "../build.ts";
import { stdout } from "node:process";
import { installGlobalCommands } from "./utils.ts";
import { botEnv } from "../env.ts";

/**
 * Installs commands to the Discord API
 */
export async function installCommands(commands: CommandData<"ext">[]) {
  const registerLoader = ora({
    stream: stdout,
    text: "Registering commands",
  }).start();

  await installGlobalCommands(
    botEnv.DISCORD_APP_ID,
    await Promise.all(
      commands.map(async (c) => {
        const config = await c.config();
        let contexts = [];
        contexts = config?.contexts
          ? config.contexts.reduce<number[]>((acc, c) => {
              switch (c) {
                case "Guild":
                  return [...acc, 0];
                case "Bot DM":
                  return [...acc, 1];
                case "Private channel":
                  return [...acc, 2];
                default:
                  return acc;
              }
            }, [])
          : [0, 1, 2];
        let integration_types = [];
        integration_types = config?.integration_type
          ? [config.integration_type == "Guild" ? 0 : 1]
          : [0, 1];
        return {
          ...config,
          name: c.name,
          description: config?.description ?? "No description provided",
          type: 1,
          integration_types,
          contexts,
        };
      }),
    ),
  );

  registerLoader.succeed("Registered commands");
}

/**
 * Creates the command handler
 * @returns A function that runs a command
 */
export function setupCommands(commands: CommandData<"ext">[]): CommandHandler {
  return async function runCommand(interaction) {
    const handler = commands.find((c) => c.name === interaction.data.name);

    if (!handler) {
      ora(`No command handler for "${interaction.data.name}"`).warn();
      return;
    }

    const commandLoader = ora({
      stream: stdout,
      text: `Running command "${handler.name}"`,
    }).start();

    try {
      await Promise.resolve(handler.do(interaction));
      commandLoader.succeed();
    } catch (error) {
      commandLoader.fail();
      console.error("└", error);
    }
  };
}

export function parseCommands(commandFiles: WalkEntry[]): CommandData[] {
  if (commandFiles.length === 0) return [];
  const generatingLoader = ora({
    stream: stdout,
    text: "Generating commands",
  }).start();
  const { addRow, log } = trackParts(commandFiles.length, "Command");

  try {
    const commandData: CommandData[] = [];

    for (const file of commandFiles) {
      if (commandData.find((c) => c.name === file.name)) {
        ora(
          `Command "${file.name}" already exists, skipping the duplicate`,
        ).warn();
        continue;
      }

      commandData.push(file);
      addRow(file.name);
    }

    generatingLoader.succeed(
      commandData.length > 0 ? "Generated commands" : "No commands found",
    );

    if (commandData.length > 0) {
      log();
    }

    return commandData;
  } catch (e) {
    generatingLoader.fail();
    throw e;
  }
}
