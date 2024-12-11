import { deferReply, editReply, followUp, reply, update } from "./responses.ts";
import type {
  BaseInteractionMethods,
  DeferredReplyOptions,
  Interaction,
  InteractionReplyOptions,
} from "./types/interaction.ts";
import {
  type APIApplicationCommandInteractionDataOption,
  type APIInteraction,
  type APIInteractionDataResolved,
  InteractionType,
} from "discord-api-types/v10";
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

function getOption(
  name: string,
  options?: APIApplicationCommandInteractionDataOption[],
  resolved?: APIInteractionDataResolved,
) {
  if (!options || options.length === 0) return;
  const option = options.find((o) => o.name === name);
  if (!option) return;
  if (!resolved) return option;
  switch (option.type) {
    case 1:
      return {
        ...option,
        getOption: (name: string) => getOption(name, option.options, resolved),
      };
    case 2:
      return {
        ...option,
        getSubcommand: (name: string) => {
          const subcommand = option.options.find((o) => o.name === name);
          if (!subcommand) return;
          return {
            ...subcommand,
            getOption: (name: string) =>
              getOption(name, subcommand.options, resolved),
          };
        },
      };
    case 3:
      return option;
    case 4:
      return option;
    case 5:
      return option;
    case 6:
      if (!resolved.users) return option;
      return {
        ...option,
        user: resolved.users[option.value],
      };
    case 7:
      if (!resolved.channels) return option;
      return {
        ...option,
        channel: resolved.channels[option.value],
      };
    case 8:
      if (!resolved.roles) return option;
      return {
        ...option,
        role: resolved.roles[option.value],
      };

      // TODO: Add other types
      // Mentionable = 9,
      // Number = 10,
      // Attachment = 11
  }
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
