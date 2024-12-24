import {
  deferReply,
  editReply,
  followUp,
  reply,
  showModal,
  update,
} from "./responses.ts";
import type {
  BaseInteractionMethods,
  DeferredReplyOptions,
  Interaction,
  InteractionReplyOptions,
} from "./types/interaction.ts";
import type {
  APIChatInputApplicationCommandInteractionData,
  APIInteraction,
  APIModalInteractionResponseCallbackData,
} from "discord-api-types/v10";
import { InteractionType } from "discord-api-types/v10";
import type { MessageOptions } from "./types/messages.ts";
import { getOption } from "./options.ts";

function baseMethods(interaction: APIInteraction): BaseInteractionMethods {
  return {
    reply: (data: InteractionReplyOptions) => reply(interaction, data),
    deferReply: (data?: DeferredReplyOptions) => deferReply(interaction, data),
    followUp: (data: InteractionReplyOptions) => followUp(interaction, data),
    editReply: (data: MessageOptions) => editReply(interaction, data),
    showModal: (data: APIModalInteractionResponseCallbackData) =>
      showModal(interaction, data),
    user: interaction.user!,
  };
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
        getOption: <Required extends boolean>(
          name: string,
          required: Required,
        ) =>
          getOption(
            name,
            required,
            "options" in interaction.data
              ? interaction.data.options
              : undefined,
            (interaction.data as APIChatInputApplicationCommandInteractionData)
              .resolved,
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
    case InteractionType.ModalSubmit: {
      return {
        ...interaction,
        ...baseMethods(interaction),
        getField: <Required extends boolean>(
          name: string,
          required: Required,
        ) => {
          const field = interaction.data.components.map((c) => c.components)
            .flat().find((
              c,
            ) => c.custom_id === name);

          if (!field) {
            if (required) throw new Error(`Field "${name}" not found`);
            return null;
          }

          return field.value;
        },
      } as unknown as Interaction<T>;
    }
    default: {
      return null as unknown as Interaction<T>;
    }
  }
}
