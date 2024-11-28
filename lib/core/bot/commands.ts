import type { Command } from "../../internal/types/config.ts";
import { join } from "node:path";
import { underline } from "@std/fmt/colors";
import ora from "ora";
import type { CommandConfig } from "../../exports/mod.ts";
import { InstallGlobalCommands } from "../../internal/utils.ts";
import type { CommandInteraction } from "../../internal/types/interaction.ts";
import { fetchFiles, type WalkEntry } from "../build.ts";
import { cwd, env } from "node:process";

/**
 * Fetches the commands from the commands directory
 *
 * @returns A function that runs a command
 */
export default async function setupCommands(
  commandFiles?: WalkEntry[],
): Promise<(interaction: CommandInteraction) => Promise<void>> {
  const generatingLoader = ora("Generating commands").start();
  let generatedN = 0;
  const generatedStr: string[][] = [[underline("\nCommand")]];

  function addCommand(name: string, totalCommands: number) {
    generatedN++;
    generatedStr.push([
      totalCommands === 1
        ? "-"
        : generatedN === 1
        ? "┌"
        : totalCommands === generatedN
        ? "└"
        : "├",
      name,
    ]);
  }

  if (!commandFiles) commandFiles = await fetchFiles("src/commands");

  try {
    const commands = await parseCommands(commandFiles);

    if (env.REGISTER_COMMANDS === "true") {
      const appId = env.DISCORD_APP_ID;

      if (!appId) {
        throw new Error("No app id provided");
      }

      InstallGlobalCommands(
        appId,
        commands.map((c) => ({
          name: c.name,
          description: c.description ?? "No description provided",
          type: 1,
          integration_types: [0, 1],
          contexts: [0, 1, 2],
          options: c.options ?? [],
        })),
      );
    }

    commands.forEach((command) => {
      addCommand(command.name, commands.length);
    });

    generatingLoader.succeed();

    console.log(generatedStr.map((row) => row.join(" ")).join("\n"));

    return async function runCommand(interaction: CommandInteraction) {
      const command = commands.find((c) => c.name === interaction.data.name);

      if (!command) {
        ora(`Command "${interaction.data.name}" not found`).warn();
        return;
      }

      const commandLoader = ora(`Running command "${command?.name}"`).start();

      try {
        await Promise.resolve(command.default(interaction));
        commandLoader.succeed();
      } catch (error) {
        commandLoader.fail();
        console.error("└", error);
      }
    };
  } catch (e) {
    generatingLoader.fail();
    throw e;
  }
}

export async function parseCommands(commandFiles: WalkEntry[]) {
  const commandData: Command[] = [];

  for (const file of commandFiles) {
    const commandModule = (await import(
      "file://" + join(cwd(), file.path)
    )) as {
      config?: CommandConfig;
      default: (interaction: CommandInteraction) => unknown;
    };
    const command: Command = {
      name: file.name,
      description: commandModule.config?.description ??
        "No description provided",
      options: commandModule.config?.options ?? [],
      default: commandModule.default,
    };

    if (commandData.find((c) => c.name === command.name)) {
      ora(
        `Command "${command.name}" already exists, skipping the duplicate`,
      ).warn();
      continue;
    }

    commandData.push(command);
  }

  return commandData;
}
