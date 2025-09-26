import { stdout } from "node:process";
import {
  ApplicationCommandType,
  ApplicationIntegrationType,
  InteractionContextType,
  InteractionType,
  PermissionFlagsBits,
  type RESTPostAPIApplicationCommandsJSONBody,
  type RESTPutAPIApplicationCommandsJSONBody,
  type RESTPutAPIApplicationGuildCommandsJSONBody,
} from "discord-api-types/v10";
import ora from "ora";
import { bulkOverwriteGlobalCommands, bulkOverwriteGuildCommands } from "../../resources/generated.resources.ts";
import type { CommandConfig, CommandData } from "../../types/config.ts";
import type { CommandAutocompleteInteraction, CommandInteraction } from "../../types/interaction.ts";
import { createHandlerSetup } from "./index.ts";

/**
 * Installs commands to the Discord API
 */
export async function installCommands(commands: CommandData[]) {
  const registerLoader = ora({
    stream: stdout,
    text: "Registering commands",
  }).start();

  const scopes = new Map<string, RESTPutAPIApplicationCommandsJSONBody | RESTPutAPIApplicationGuildCommandsJSONBody>([
    ["global", []],
  ]);

  for (const command of commands) {
    if (command.exports === null) return;
    if ("config" in command.data) {
      ora(
        "In the next major version of Dressed, command config must be passed in using `command.exports` instead of `command.data`",
      ).warn();
      command.exports.config = command.data.config; // TODO Remove check before next major release
    }

    const config = command.exports.config ?? ({} as CommandConfig);

    if (!config.type) {
      config.type = "ChatInput";
    }

    if (config.type === "ChatInput") {
      config.description = config.description ?? "No description provided";
    }

    if (Array.isArray(config.default_member_permissions)) {
      config.default_member_permissions = config.default_member_permissions
        .reduce((p, k) => p | PermissionFlagsBits[k], BigInt(0))
        .toString();
    }

    if (config.contexts) {
      config.contexts = [...new Set(config.contexts.map((c) => InteractionContextType[c] as never))];
    }

    if (config.integration_type) {
      config.integration_types = [ApplicationIntegrationType[`${config.integration_type}Install`]];
    }

    for (const guild of config.guilds ?? ["global"]) {
      scopes.set(
        guild,
        (scopes.get(guild) ?? []).concat({
          ...config,
          name: command.name,
          type: ApplicationCommandType[config.type],
        } as RESTPostAPIApplicationCommandsJSONBody),
      );
    }
  }

  for (const [scope, commands] of scopes) {
    if (scope === "global") {
      await bulkOverwriteGlobalCommands(commands);
    } else {
      await bulkOverwriteGuildCommands(scope, commands as never);
    }
  }

  registerLoader.succeed("Registered commands");
}

/**
 * Creates the command handler
 * @returns A function that runs a command
 */
export const setupCommands: ReturnType<
  typeof createHandlerSetup<CommandData, CommandInteraction | CommandAutocompleteInteraction>
> = createHandlerSetup({
  itemMessages: (interaction) => ({
    noItem: `No command handler for "${interaction.data.name}"`,
    middlewareKey: "commands",
    pending: (item) =>
      `Running${interaction.type === InteractionType.ApplicationCommandAutocomplete ? " autocomplete for " : " "}command "${item.name}"`,
  }),
  findItem(interaction, items) {
    const item = items.find((i) => i.name === interaction.data.name);
    if (!item) {
      return;
    }
    return [item, [interaction]];
  },
});
