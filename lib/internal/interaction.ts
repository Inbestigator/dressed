import { deferReply, editReply, followUp, reply, update } from "./responses.ts";
import type {
  DeferredReplyOptions,
  Interaction,
  InteractionReplyOptions,
} from "./types/interaction.ts";
import { type APIInteraction, InteractionType } from "discord-api-types/v10";
import type { EditMessageOptions } from "./types/messages.ts";

export default function createInteraction<T extends APIInteraction>(
  interaction: T,
): Interaction<T> {
  switch (interaction.type) {
    case InteractionType.ApplicationCommand: {
      return {
        ...interaction,
        reply: (data: InteractionReplyOptions) => reply(interaction, data),
        deferReply: (data?: DeferredReplyOptions) =>
          deferReply(interaction, data),
        followUp: (data: InteractionReplyOptions) =>
          followUp(interaction, data),
        editReply: (data: EditMessageOptions) => editReply(interaction, data),
      } as unknown as Interaction<T>;
    }
    case InteractionType.MessageComponent: {
      return {
        ...interaction,
        reply: (data: InteractionReplyOptions) => reply(interaction, data),
        deferReply: (data?: DeferredReplyOptions) =>
          deferReply(interaction, data),
        followUp: (data: InteractionReplyOptions) =>
          followUp(interaction, data),
        update: (data: EditMessageOptions) => update(interaction, data),
        editReply: (data: EditMessageOptions) => editReply(interaction, data),
      } as unknown as Interaction<T>;
    }
    default: {
      return null as unknown as Interaction<T>;
    }
  }
}
