import type {
  CommandConfig,
  CommandData,
  CommandHandler,
} from "../types/config.ts";
import ora from "ora";
import { trackParts, type WalkEntry } from "../build.ts";
import { stdout } from "node:process";
import { installGlobalCommands, logRunnerError } from "./utils.ts";
import { botEnv } from "../env.ts";
import importUserFile from "../server/import.ts";
import {
  ApplicationCommandType,
  ApplicationIntegrationType,
  InteractionContextType,
} from "discord-api-types/v10";

/**
 * Installs commands to the Discord API
 */
export async function installCommands(commands: CommandData[]) {
  const registerLoader = ora({
    stream: stdout,
    text: "Registering commands",
  }).start();

  await installGlobalCommands(
    botEnv.DISCORD_APP_ID,
    await Promise.all(
      commands.map(async (c) => {
        const config =
          (await importUserFile(c)).config ?? ({} as CommandConfig);
        if (!config.type) {
          config.type = "ChatInput";
        }
        return {
          ...config,
          name: c.name,
          type: ApplicationCommandType[config.type],
          integration_types: config.integration_type
            ? [ApplicationIntegrationType[`${config.integration_type}Install`]]
            : [0, 1],
          contexts: config.contexts
            ? config.contexts.reduce<number[]>(
                (p, c) =>
                  !p.includes(InteractionContextType[c])
                    ? [...p, InteractionContextType[c]]
                    : p,
                [],
              )
            : [0, 1, 2],
          ...(config.type === "ChatInput"
            ? {
                description: config.description ?? "No description provided",
              }
            : {}),
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
export function setupCommands(commands: CommandData[]): CommandHandler {
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
      await (await importUserFile(handler)).default(interaction);
      commandLoader.succeed();
    } catch (e) {
      logRunnerError(e, commandLoader);
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
