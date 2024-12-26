import type { Command, CommandHandler } from "../../internal/types/config.ts";
import { join, normalize } from "node:path";
import ora from "ora";
import type { CommandConfig } from "../../exports/mod.ts";
import { installGlobalCommands } from "../../internal/utils.ts";
import type { CommandInteraction } from "../../internal/types/interaction.ts";
import { trackParts, type WalkEntry } from "../build.ts";
import { cwd, env } from "node:process";
import { runtime } from "std-env";

/**
 * @returns A function that runs a command
 */
export default async function setupCommands(
  commands: Omit<Command, "default">[],
): Promise<(interaction: CommandInteraction) => Promise<void>> {
  if (env.REGISTER_COMMANDS === "true") {
    const appId = env.DISCORD_APP_ID;

    if (!appId) {
      throw new Error("No app id provided");
    }

    await installGlobalCommands(
      appId,
      commands.map((c) => ({
        ...c,
        type: 1,
        integration_types: [0, 1],
        contexts: [0, 1, 2],
      })),
    );
  }

  return async function runCommand(interaction: CommandInteraction) {
    const command = commands.find((c) => c.name === interaction.data.name);

    if (!command) {
      ora(`Command "${interaction.data.name}" not found`).warn();
      return;
    }

    const commandLoader = ora(`Running command "${command?.name}"`).start();

    try {
      const commandModule = (await import(
        (runtime !== "bun" ? "file:" : "") +
          normalize(join(cwd(), command.path))
      )) as {
        default: CommandHandler;
      };
      await Promise.resolve(commandModule.default(interaction));
      commandLoader.succeed();
    } catch (error) {
      commandLoader.fail();
      console.error("└", error);
    }
  };
}

export async function parseCommands(commandFiles: WalkEntry[]) {
  const generatingLoader = ora("Generating commands").start();
  const { addRow, removeN, log } = trackParts("\nCommand", commandFiles.length);

  try {
    const commandData: Command[] = [];

    for (const file of commandFiles) {
      removeN();
      const commandModule = (await import(
        (runtime !== "bun" ? "file:" : "") + normalize(join(cwd(), file.path))
      )) as {
        config?: CommandConfig;
      };
      const command: Command = {
        ...commandModule.config,
        name: file.name,
        description: commandModule.config?.description ??
          "No description provided",
        path: file.path,
      };

      if (commandData.find((c) => c.name === command.name)) {
        ora(
          `Command "${command.name}" already exists, skipping the duplicate`,
        ).warn();
        continue;
      }

      commandData.push(command);
      addRow(command.name);
    }

    generatingLoader.succeed();
    log();

    return commandData;
  } catch (e) {
    generatingLoader.fail();
    throw e;
  }
}
