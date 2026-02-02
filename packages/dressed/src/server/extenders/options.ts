import {
  type APIApplicationCommandInteractionDataOption,
  type APIApplicationCommandOption,
  type APIInteractionDataResolved,
  ApplicationCommandOptionType,
} from "discord-api-types/v10";
import type { CommandOptionValue, MapOptions } from "../../types/interaction.ts";

export function parseOptions(
  options: APIApplicationCommandInteractionDataOption[] = [],
  resolved?: APIInteractionDataResolved,
): MapOptions<APIApplicationCommandOption[]> {
  return Object.fromEntries(
    options.map((option) => {
      let value: CommandOptionValue;
      switch (option.type) {
        case ApplicationCommandOptionType.Subcommand: {
          value = { name: option.name, options: parseOptions(option.options, resolved) };
          break;
        }
        case ApplicationCommandOptionType.SubcommandGroup: {
          value = { name: option.name, subcommands: parseOptions(option.options, resolved) };
          break;
        }
        case ApplicationCommandOptionType.String:
        case ApplicationCommandOptionType.Integer:
        case ApplicationCommandOptionType.Boolean:
        case ApplicationCommandOptionType.Number: {
          value = option.value;
          break;
        }
        case ApplicationCommandOptionType.User:
        case ApplicationCommandOptionType.Channel:
        case ApplicationCommandOptionType.Role:
        case ApplicationCommandOptionType.Attachment: {
          const resolvedKey = (["users", "channels", "roles", undefined, undefined, "attachments"] as const)[
            option.type - 6
          ];
          if (!resolvedKey) throw new Error("Could not determine key of option");
          if (!resolved?.[resolvedKey]) {
            throw new Error(`No ${resolvedKey} found for option "${option.name}"`);
          }
          value = resolved[resolvedKey][option.value];
          break;
        }
        case ApplicationCommandOptionType.Mentionable: {
          if (!resolved?.users && !resolved?.roles) {
            throw new Error(`No mentionables found for option "${option.name}"`);
          }
          value = resolved.users?.[option.value] ?? resolved.roles?.[option.value];
          break;
        }
      }
      return [option.name, value];
    }),
  );
}

export function getFocused(options: APIApplicationCommandInteractionDataOption[] = [], path = ""): string | undefined {
  for (const option of options) {
    if ("focused" in option && option.focused) return `${path}.${option.name}`;
    if ("options" in option) {
      const focused = getFocused(option.options, `${path}.${option.name}`);
      if (focused) return focused;
    }
  }
}
