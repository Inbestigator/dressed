import type {
  BuildCommand,
  Command,
  CommandHandler,
} from "../../internal/types/config.ts";
import ora from "ora";
import { installGlobalCommands } from "../../internal/utils.ts";
import type { CommandInteraction } from "../../internal/types/interaction.ts";
import { trackParts, type WalkEntry } from "../build.ts";
import { env } from "node:process";

/**
 * Installs commands to the Discord API
 */
export async function installCommands(commands: Command[]) {
  const appId = env.DISCORD_APP_ID;
  const registerLoader = ora("Registering commands").start();

  if (!appId) {
    registerLoader.fail();
    throw new Error(
      "No app id provided, make sure to provide a DISCORD_APP_ID environment variable",
    );
  }

  await installGlobalCommands(
    appId,
    await Promise.all(commands.map(async (c) => {
      const commandModule = await c.import();
      let contexts = [];
      contexts = commandModule.config?.contexts
        ? commandModule.config.contexts.reduce<number[]>((acc, c) => {
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
      integration_types = commandModule.config?.integration_type
        ? [commandModule.config.integration_type == "Guild" ? 0 : 1]
        : [0, 1];
      return {
        ...commandModule.config,
        name: c.name,
        description: commandModule.config?.description ??
          "No description provided",
        type: 1,
        integration_types,
        contexts,
      };
    })),
  );

  registerLoader.succeed("Registered commands");
}

/**
 * @returns A function that runs a command
 */
export default function setupCommands(
  commands: Command[],
): CommandHandler {
  return async function runCommand(interaction: CommandInteraction) {
    const command = commands.find((c) => c.name === interaction.data.name);

    if (!command) {
      ora(`Command "${interaction.data.name}" not found`).warn();
      return;
    }

    const commandLoader = ora(`Running command "${command?.name}"`).start();

    try {
      await Promise.resolve((await command.import()).default(interaction));
      commandLoader.succeed();
    } catch (error) {
      commandLoader.fail();
      console.error("└", error);
    }
  };
}

export function parseCommands(commandFiles: WalkEntry[]) {
  const generatingLoader = ora("Generating commands").start();
  const { addRow, removeN, log } = trackParts(commandFiles.length, "Command");

  try {
    const commandData: BuildCommand[] = [];

    for (const file of commandFiles) {
      removeN();
      const command: BuildCommand = {
        name: file.name,
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

    generatingLoader.succeed(
      commandData.length > 0 ? "Generated commands" : "No commands found",
    );
    commandData.length > 0 && log();

    return commandData;
  } catch (e) {
    generatingLoader.fail();
    throw e;
  }
}
