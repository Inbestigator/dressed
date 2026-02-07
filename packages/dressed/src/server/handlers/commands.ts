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
import { bulkOverwriteAppCommands, bulkOverwriteGuildCommands } from "../../resources/generated.resources.ts";
import type { CommandConfig, CommandData } from "../../types/config.ts";
import type { CommandAutocompleteInteraction, CommandInteraction } from "../../types/interaction.ts";
import logger from "../../utils/log.ts";
import { createHandlerSetup } from "./index.ts";

function normalizeData(config: CommandConfig) {
  config.type ??= "ChatInput";
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

  return config;
}

/**
 * Registers application commands to the Discord API
 */
export async function registerCommands(commands: CommandData[]) {
  logger.defer("Registering commands");

  const scopes = new Map<string, RESTPutAPIApplicationCommandsJSONBody | RESTPutAPIApplicationGuildCommandsJSONBody>([
    ["global", []],
  ]);

  for (const command of commands) {
    const config = normalizeData(command.exports.config ?? ({} as CommandConfig));
    for (const guild of config.guilds ?? ["global"]) {
      scopes.set(
        guild,
        (scopes.get(guild) ?? []).concat({
          ...config,
          name: command.name,
          type: ApplicationCommandType[config.type as keyof typeof ApplicationCommandType],
        } as RESTPostAPIApplicationCommandsJSONBody),
      );
    }
  }

  for (const [scope, commands] of scopes) {
    if (scope === "global") {
      await bulkOverwriteAppCommands(commands);
    } else {
      await bulkOverwriteGuildCommands(scope, commands as never);
    }
  }

  logger.succeed("Registered commands");
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
    if (!item) return;
    return [item, [interaction]];
  },
});
