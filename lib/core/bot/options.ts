import type {
  APIApplicationCommandAttachmentOption,
  APIApplicationCommandBooleanOption,
  APIApplicationCommandChannelOption,
  APIApplicationCommandIntegerOption,
  APIApplicationCommandMentionableOption,
  APIApplicationCommandNumberOption,
  APIApplicationCommandOption,
  APIApplicationCommandRoleOption,
  APIApplicationCommandStringOption,
  APIApplicationCommandSubcommandGroupOption,
  APIApplicationCommandSubcommandOption,
  APIApplicationCommandUserOption,
} from "discord-api-types/v10";

import { ApplicationCommandOptionType } from "discord-api-types/v10";

type OptionTypes =
  | "Subcommand"
  | "SubcommandGroup"
  | "String"
  | "Integer"
  | "Boolean"
  | "User"
  | "Channel"
  | "Role"
  | "Mentionable"
  | "Number"
  | "Attachment";

type SubcommandOption = Omit<APIApplicationCommandSubcommandOption, "type"> & {
  type: OptionTypes;
};

type SubcommandGroupOption =
  & Omit<APIApplicationCommandSubcommandGroupOption, "type">
  & {
    type: OptionTypes;
  };

type StringOption = Omit<APIApplicationCommandStringOption, "type"> & {
  type: OptionTypes;
};

type IntegerOption = Omit<APIApplicationCommandIntegerOption, "type"> & {
  type: OptionTypes;
};

type BooleanOption = Omit<APIApplicationCommandBooleanOption, "type"> & {
  type: OptionTypes;
};

type UserOption = Omit<APIApplicationCommandUserOption, "type"> & {
  type: OptionTypes;
};

type ChannelOption = Omit<APIApplicationCommandChannelOption, "type"> & {
  type: OptionTypes;
};

type RoleOption = Omit<APIApplicationCommandRoleOption, "type"> & {
  type: OptionTypes;
};

type MentionableOption =
  & Omit<APIApplicationCommandMentionableOption, "type">
  & {
    type: OptionTypes;
  };

type NumberOption = Omit<APIApplicationCommandNumberOption, "type"> & {
  type: OptionTypes;
};

type AttachmentOption = Omit<APIApplicationCommandAttachmentOption, "type"> & {
  type: OptionTypes;
};

type OptionType =
  | SubcommandOption
  | SubcommandGroupOption
  | StringOption
  | IntegerOption
  | BooleanOption
  | UserOption
  | ChannelOption
  | RoleOption
  | MentionableOption
  | NumberOption
  | AttachmentOption;

/**
 * Creates a command option
 */
export function Option(
  data: OptionType,
): APIApplicationCommandOption {
  switch ((data as OptionType).type) {
    case "Subcommand":
      return {
        ...data,
        type: ApplicationCommandOptionType.Subcommand,
      } as ReturnType<typeof Option>;
    case "SubcommandGroup":
      return {
        ...data,
        type: ApplicationCommandOptionType.SubcommandGroup,
      } as ReturnType<typeof Option>;
    case "String":
      return {
        ...data,
        type: ApplicationCommandOptionType.String,
      } as ReturnType<typeof Option>;
    case "Integer":
      return {
        ...data,
        type: ApplicationCommandOptionType.Integer,
      } as ReturnType<typeof Option>;
    case "Boolean":
      return {
        ...data,
        type: ApplicationCommandOptionType.Boolean,
      } as ReturnType<typeof Option>;
    case "User":
      return {
        ...data,
        type: ApplicationCommandOptionType.User,
      } as ReturnType<typeof Option>;
    case "Channel":
      return {
        ...data,
        type: ApplicationCommandOptionType.Channel,
      } as ReturnType<typeof Option>;
    case "Role":
      return {
        ...data,
        type: ApplicationCommandOptionType.Role,
      } as ReturnType<typeof Option>;
    case "Mentionable":
      return {
        ...data,
        type: ApplicationCommandOptionType.Mentionable,
      } as ReturnType<typeof Option>;
    case "Number":
      return {
        ...data,
        type: ApplicationCommandOptionType.Number,
      } as ReturnType<typeof Option>;
    case "Attachment":
      return {
        ...data,
        type: ApplicationCommandOptionType.Attachment,
      } as ReturnType<typeof Option>;
    default:
      throw new Error(`Unknown option type: ${(data as OptionType).type}`);
  }
}
