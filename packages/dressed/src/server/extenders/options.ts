import {
  ApplicationCommandOptionType,
  type APIApplicationCommandInteractionDataOption,
  type APIAttachment,
  type APIInteractionDataResolved,
  type APIInteractionDataResolvedChannel,
  type APIRole,
  type APIUser,
} from "discord-api-types/v10";
import type { CommandInteraction } from "../../types/interaction.ts";

export interface OptionValueGetters<N> {
  /**
   * Get the option as a subcommand
   */
  subcommand: () => {
    /**
     * Get an option from the subcommand
     * @param name The name of the option
     * @param required Whether the option is required
     */
    getOption: CommandInteraction["getOption"];
    name: N;
  };
  /**
   * Get the option as a subcommand group
   */
  subcommandGroup: () => {
    /**
     * Get a subcommand from the group
     * @param name The name of the subcommand
     */
    getSubcommand: <N extends string>(
      name: N,
    ) => ReturnType<OptionValueGetters<N>["subcommand"]> | undefined;
    name: N;
  };
  /**
   * Get the option as a string
   */
  string: () => string;
  /**
   * Get the option as an integer
   */
  integer: () => number;
  /**
   * Get the option as a boolean
   */
  boolean: () => boolean;
  /**
   * Get the option as a user
   */
  user: () => APIUser;
  /**
   * Get the option as a channel
   */
  channel: () => APIInteractionDataResolvedChannel;
  /**
   * Get the option as a role
   */
  role: () => APIRole;
  /**
   * Get the option as a mentionable
   */
  mentionable: () => APIUser | APIRole;
  /**
   * Get the option as a number
   */
  number: () => number;
  /**
   * Get the option as an attachment
   */
  attachment: () => APIAttachment;
}

const optionTypeToName = {
  [ApplicationCommandOptionType.Subcommand]: "a subcommand",
  [ApplicationCommandOptionType.SubcommandGroup]: "a subcommand group",
  [ApplicationCommandOptionType.String]: "a string",
  [ApplicationCommandOptionType.Integer]: "an integer",
  [ApplicationCommandOptionType.Boolean]: "a boolean",
  [ApplicationCommandOptionType.User]: "a user",
  [ApplicationCommandOptionType.Channel]: "a channel",
  [ApplicationCommandOptionType.Role]: "a role",
  [ApplicationCommandOptionType.Mentionable]: "a mentionable",
  [ApplicationCommandOptionType.Number]: "a number",
  [ApplicationCommandOptionType.Attachment]: "an attachment",
};

export function getOption<N extends string, R extends boolean>(
  name: N,
  required: R,
  options: APIApplicationCommandInteractionDataOption[],
  resolved?: APIInteractionDataResolved,
): R extends true ? OptionValueGetters<N> : OptionValueGetters<N> | undefined {
  const option = options.find((o) => o.name === name);
  if (!option) {
    if (required) throw new Error(`Required option "${name}" not found`);
    return undefined as ReturnType<typeof getOption<N, R>>;
  }

  const returnOption = (
    type: Exclude<
      ApplicationCommandOptionType,
      | ApplicationCommandOptionType.Subcommand
      | ApplicationCommandOptionType.SubcommandGroup
    >,
    resolvedKey?: keyof APIInteractionDataResolved,
  ) => {
    return () => {
      if (option.type !== type) {
        throw new Error(
          `The option ${option.name} is ${optionTypeToName[option.type]}, not ${optionTypeToName[type]}`,
        );
      }
      if (resolvedKey) {
        if (!resolved?.[resolvedKey]) {
          throw new Error(`No ${resolvedKey} found for option ${option.name}`);
        }
        return resolved[resolvedKey][option.value as string];
      }
      return option.value;
    };
  };

  return {
    subcommand() {
      if (option.type !== ApplicationCommandOptionType.Subcommand) {
        throw new Error(
          `The option ${option.name} is ${optionTypeToName[option.type]}, not a subcommand`,
        );
      }
      return {
        name,
        getOption: (n, r) =>
          getOption(n, r ?? false, option.options ?? [], resolved),
      };
    },
    subcommandGroup() {
      if (option.type !== ApplicationCommandOptionType.SubcommandGroup) {
        throw new Error(
          `The option ${option.name} is ${optionTypeToName[option.type]}, not a subcommand group`,
        );
      }
      return {
        name,
        getSubcommand: (n) =>
          getOption(n, false, option.options, resolved)?.subcommand(),
      };
    },
    string: returnOption(ApplicationCommandOptionType.String),
    integer: returnOption(ApplicationCommandOptionType.Integer),
    boolean: returnOption(ApplicationCommandOptionType.Boolean),
    user: returnOption(ApplicationCommandOptionType.User, "users"),
    channel: returnOption(ApplicationCommandOptionType.Channel, "channels"),
    role: returnOption(ApplicationCommandOptionType.Role, "roles"),
    mentionable() {
      if (option.type !== ApplicationCommandOptionType.Mentionable) {
        throw new Error(
          `The option ${option.name} is ${optionTypeToName[option.type]}, not a mentionable`,
        );
      }
      if (!resolved?.users && !resolved?.roles) {
        throw new Error(`No mentionables found for option ${option.name}`);
      }
      return resolved.users?.[option.value] ?? resolved.roles?.[option.value];
    },
    number: returnOption(ApplicationCommandOptionType.Number),
    attachment: returnOption(
      ApplicationCommandOptionType.Attachment,
      "attachments",
    ),
  } as ReturnType<typeof getOption<N, R>>;
}
