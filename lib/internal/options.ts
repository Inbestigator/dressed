import type {
  APIApplicationCommandInteractionDataOption,
  APIAttachment,
  APIInteractionDataResolved,
  APIInteractionDataResolvedChannel,
  APIRole,
  APIUser,
} from "discord-api-types/v10";

export interface OptionReaders {
  /**
   * Get the option as a subcommand
   */
  subcommand: () => {
    getOption: (name: string) => ReturnType<typeof getOption>;
  };
  /**
   * Get the option as a group subcommand
   */
  groupSubcommand: () => {
    getSubcommand: (name: string) => {
      getOption: (name: string) => ReturnType<typeof getOption>;
    };
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

export function getOption<Required extends boolean>(
  name: string,
  isRequired: Required,
  options?: APIApplicationCommandInteractionDataOption[],
  resolved?: APIInteractionDataResolved,
): Required extends true ? NonNullable<OptionReaders> : OptionReaders | null {
  if (!options || options.length === 0) throw new Error("No options found");
  const option = options.find((o) => o.name === name);
  if (!option) {
    if (isRequired) throw new Error(`Required option ${name} not found`);
    return null as Required extends true ? never : null;
  }

  return {
    subcommand: () => {
      if (option.type !== 1) throw new Error("Not a subcommand");
      return {
        getOption: (name: string, isRequired = false) =>
          getOption(name, isRequired, option.options, resolved),
      };
    },
    groupSubcommand: () => {
      if (option.type !== 2) throw new Error("Not a group subcommand");
      return {
        getSubcommand: (name: string) => {
          const subcommand = option.options.find((o) => o.name === name);
          if (!subcommand) throw new Error(`Subcommand ${name} not found`);
          return {
            ...subcommand,
            getOption: (name: string, isRequired = false) =>
              getOption(name, isRequired, subcommand.options, resolved),
          };
        },
      };
    },
    string: () => {
      if (option.type !== 3) throw new Error("Not a string");
      return option.value;
    },
    integer: () => {
      if (option.type !== 4) throw new Error("Not an integer");
      return option.value;
    },
    boolean: () => {
      if (option.type !== 5) throw new Error("Not a boolean");
      return option.value;
    },
    user: () => {
      if (option.type !== 6) throw new Error("Not a user");
      if (!resolved?.users) throw new Error("No users found");
      return resolved.users[option.value];
    },
    channel: () => {
      if (option.type !== 7) throw new Error("Not a channel");
      if (!resolved?.channels) throw new Error("No channels found");
      return resolved.channels[option.value];
    },
    role: () => {
      if (option.type !== 8) throw new Error("Not a role");
      if (!resolved?.roles) throw new Error("No roles found");
      return resolved.roles[option.value];
    },
    mentionable: () => {
      if (option.type !== 9) throw new Error("Not a mentionable");
      if (!resolved?.users) throw new Error("No users found");
      if (!resolved?.roles) throw new Error("No roles found");
      return resolved.users[option.value] || resolved.roles[option.value];
    },
    number: () => {
      if (option.type !== 10) throw new Error("Not a number");
      return option.value;
    },
    attachment: () => {
      if (option.type !== 11) throw new Error("Not an attachment");
      if (!resolved?.attachments) throw new Error("No attachments found");
      return resolved.attachments[option.value];
    },
  };
}
