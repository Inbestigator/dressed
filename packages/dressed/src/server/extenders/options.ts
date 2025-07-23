import type {
  APIApplicationCommandInteractionDataOption,
  APIAttachment,
  APIInteractionDataResolved,
  APIInteractionDataResolvedChannel,
  APIRole,
  APIUser,
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

  return {
    subcommand: () => {
      if (option.type !== 1) throw new Error("Not a subcommand");
      return {
        name,
        getOption: (name: string, required) =>
          getOption(name, required ?? false, option.options ?? [], resolved),
      };
    },
    subcommandGroup: () => {
      if (option.type !== 2) throw new Error("Not a subcommand group");
      return {
        name,
        getSubcommand: (name: string) =>
          getOption(name, false, option.options, resolved)?.subcommand(),
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
      if (resolved?.users?.[option.value]) {
        return resolved.users[option.value];
      } else if (resolved?.roles?.[option.value]) {
        return resolved.roles[option.value];
      } else {
        throw new Error("No mentionables found");
      }
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
  } as ReturnType<typeof getOption<N, R>>;
}
