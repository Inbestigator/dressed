import type { Command } from "../../internal/types/config.ts";
import { join } from "node:path";
import { underline, yellow } from "@std/fmt/colors";
import loader from "../../internal/loader.ts";
import type { CommandConfig } from "../../exports/mod.ts";
import { InstallGlobalCommands } from "../../internal/utils.ts";
import type { CommandInteraction } from "../../internal/types/interaction.ts";
import { walk } from "@std/fs/walk";

/**
 * Fetches the commands from the commands directory
 *
 * @returns A function that runs a command
 */
export default async function setupCommands(): Promise<
  (interaction: CommandInteraction) => Promise<void>
> {
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

  try {
    const commands = await fetchCommands();

    if (Deno.env.get("REGISTER_COMMANDS") === "true") {
      const appId = Deno.env.get("DISCORD_APP_ID");

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

    await generatingLoader.resolve();

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
        await commandLoader.resolve();
      } catch (error) {
        await commandLoader.error();
        console.error(" └", error);
      }
    };
  } catch (e) {
    await generatingLoader.error();
    throw e;
  }
}

async function fetchCommands() {
  const files = await Array.fromAsync(
    walk("./src/commands", {
      exts: [".ts"],
      includeDirs: false,
    }),
  );
  const commandData: Command[] = [];

  for (const file of files) {
    const commandModule = (await import(
      join("file://", Deno.cwd(), file.path)
    )) as {
      config?: CommandConfig;
      default: (interaction: CommandInteraction) => unknown;
    };
    const command: Command = {
      name: file.name.split(".")[0],
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
