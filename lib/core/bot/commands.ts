import type { Command } from "../../internal/types/config.ts";
import { join } from "node:path";
import { underline, yellow } from "@std/fmt/colors";
import loader from "../../internal/loader.ts";
import type { CommandConfig } from "../../exports/mod.ts";
import { InstallGlobalCommands } from "../../internal/utils.ts";
import type { CommandInteraction } from "../../internal/types/interaction.ts";
import { fetchCommands, type WalkEntry } from "../build.ts";
import { cwd, env } from "node:process";

/**
 * Fetches the commands from the commands directory
 *
 * @returns A function that runs a command
 */
export default async function setupCommands(
  commandFiles?: WalkEntry[],
): Promise<(interaction: CommandInteraction) => Promise<void>> {
  const generatingLoader = loader("Generating commands");
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

  if (!commandFiles) commandFiles = await fetchCommands();

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

    generatingLoader.resolve();

    console.log(generatedStr.map((row) => row.join(" ")).join("\n"));

    return async function runCommand(interaction: CommandInteraction) {
      const command = commands.find((c) => c.name === interaction.data.name);

      if (!command) {
        console.warn(
          ` ${yellow("!")} Command "${interaction.data.name}" not found`,
        );
        return;
      }

      const commandLoader = loader(`Running command "${command?.name}"`);

      try {
        await Promise.resolve(command.default(interaction));
        commandLoader.resolve();
      } catch (error) {
        commandLoader.error();
        console.error(" └", error);
      }
    };
  } catch (e) {
    generatingLoader.error();
    throw e;
  }
}

export async function parseCommands(commandFiles: WalkEntry[]) {
  const commandData: Command[] = [];

  for (const file of commandFiles) {
    const commandModule = (await import(join("file://", cwd(), file.path))) as {
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
      console.warn(
        ` ${
          yellow("!")
        } Command "${command.name}" already exists, skipping the duplicate`,
      );
      continue;
    }

    commandData.push(command);
  }

  return commandData;
}
