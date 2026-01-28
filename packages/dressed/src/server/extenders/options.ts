import {
  type APIApplicationCommandInteractionDataOption,
  type APIInteractionDataResolved,
  type APIRole,
  type APIUser,
  ApplicationCommandOptionType,
} from "discord-api-types/v10";
import type { OptionValue } from "../../types/interaction.ts";

type AnyOptionValue = OptionValue<{ type: number; name: string; description: string; options: [] }>;

export function parseOptions(
  options?: APIApplicationCommandInteractionDataOption[],
  resolved?: APIInteractionDataResolved,
): Record<string, AnyOptionValue> | undefined {
  if (!options?.length) return;
  return Object.fromEntries(
    options.map((option) => {
      let value: AnyOptionValue;
      switch (option.type) {
        case ApplicationCommandOptionType.Subcommand: {
          value = { name: option.name, options: parseOptions(option.options, resolved) } as OptionValue<{
            type: ApplicationCommandOptionType.Subcommand;
            name: string;
            description: string;
            options: [];
          }>;
          break;
        }
        case ApplicationCommandOptionType.SubcommandGroup: {
          value = { name: option.name, subcommands: parseOptions(option.options, resolved) } as OptionValue<{
            type: ApplicationCommandOptionType.SubcommandGroup;
            name: string;
            description: string;
            options: [];
          }>;
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
            throw new Error(`No ${resolvedKey} found for option ${option.name}`);
          }
          value = resolved[resolvedKey][option.value];
          break;
        }
        case ApplicationCommandOptionType.Mentionable: {
          if (!resolved?.users && !resolved?.roles) {
            throw new Error(`No mentionables found for option ${option.name}`);
          }
          value = (resolved.users?.[option.value] ?? resolved.roles?.[option.value]) as APIUser | APIRole;
          break;
        }
      }
      return [option.name, value];
    }),
  );
}
