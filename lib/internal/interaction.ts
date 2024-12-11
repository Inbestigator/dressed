import { deferReply, editReply, followUp, reply, update } from "./responses.ts";
import type {
  BaseInteractionMethods,
  DeferredReplyOptions,
  Interaction,
  InteractionReplyOptions,
} from "./types/interaction.ts";
import type {
  APIApplicationCommandInteractionDataOption,
  APIInteraction,
  APIInteractionDataResolved,
  APIInteractionDataResolvedChannel,
  APIRole,
  APIUser,
} from "discord-api-types/v10";
import { InteractionType } from "discord-api-types/v10";
import type { MessageOptions } from "./types/messages.ts";

function baseMethods(interaction: APIInteraction): BaseInteractionMethods {
  return {
    reply: (data: InteractionReplyOptions) => reply(interaction, data),
    deferReply: (data?: DeferredReplyOptions) => deferReply(interaction, data),
    followUp: (data: InteractionReplyOptions) => followUp(interaction, data),
    editReply: (data: MessageOptions) => editReply(interaction, data),
    user: interaction.user!,
  };
}

export function getOption(
  name: string,
  options?: APIApplicationCommandInteractionDataOption[],
  resolved?: APIInteractionDataResolved,
): {
  subcommand: () => {
    getOption: (name: string) => ReturnType<typeof getOption>;
  };
  groupSubcommand: () => {
    getSubcommand: (name: string) => {
      getOption: (name: string) => ReturnType<typeof getOption>;
    };
  };
  string: () => string;
  integer: () => number;
  boolean: () => boolean;
  user: () => APIUser;
  channel: () => APIInteractionDataResolvedChannel;
  role: () => APIRole;
} {
  if (!options || options.length === 0) throw new Error("No options found");
  const option = options.find((o) => o.name === name);
  if (!option) throw new Error(`Option ${name} not found`);

  return {
    subcommand: () => {
      if (option.type !== 1) throw new Error("Not a subcommand");
      return {
        getOption: (name: string) => getOption(name, option.options, resolved),
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
            getOption: (name: string) =>
              getOption(name, subcommand.options, resolved),
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
  };
  // TODO: Add other types
  // Mentionable = 9,
  // Number = 10,
  // Attachment = 11
}

export default function createInteraction<T extends APIInteraction>(
  interaction: T,
): Interaction<T> {
  if (!interaction.user && interaction.member) {
    interaction.user = interaction.member.user;
  }

  switch (interaction.type) {
    case InteractionType.ApplicationCommand: {
      return {
        ...interaction,
        ...baseMethods(interaction),
        getOption: (name: string) =>
          getOption(
            name,
            "options" in interaction.data
              ? interaction.data.options
              : undefined,
            interaction.data.resolved as APIInteractionDataResolved,
          ),
      } as unknown as Interaction<T>;
    }
    case InteractionType.MessageComponent: {
      return {
        ...interaction,
        ...baseMethods(interaction),
        update: (data: MessageOptions) => update(interaction, data),
      } as unknown as Interaction<T>;
    }
    default: {
      return null as unknown as Interaction<T>;
    }
  }
}
