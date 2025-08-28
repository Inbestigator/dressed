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
  /** Return the option as a subcommand - Option type must be `Subcommand` */
  subcommand: () => {
    /**
     * Get an option from the subcommand
     * @param name The name of the option
     * @param required Whether the option is required
     */
    getOption: CommandInteraction["getOption"];
    name: N;
  };
  /** Return the option as a subcommand group - Option type must be `SubcommandGroup` */
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
  /** Return the option's value as a string - Option type must be `String` */
  string: () => string;
  /** Return the option's value as an integer - Option type must be `Integer` */
  integer: () => number;
  /** Return the option's value as a boolean - Option type must be `Boolean` */
  boolean: () => boolean;
  /** Get the user from the option - Option type must be `User` */
  user: () => APIUser;
  /** Get the channel from the option - Option type must be `Channel` */
  channel: () => APIInteractionDataResolvedChannel;
  /** Get the role from the option - Option type must be `Role` */
  role: () => APIRole;
  /** Get the mentionable from the option - Option type must be `Mentionable` */
  mentionable: () => APIUser | APIRole;
  /** Return the option's value as a number - Option type must be `Number` */
  number: () => number;
  /** Get the attachment from the option - Option type must be `Attachment` */
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

  const returnOption =
    (
      type: Exclude<ApplicationCommandOptionType, 1 | 2>,
      resolvedKey?: keyof APIInteractionDataResolved,
    ) =>
    () => {
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
