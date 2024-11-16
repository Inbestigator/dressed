import type {
  APIApplicationCommandInteraction,
  APIEmbed,
  APIInteraction,
  APIMessageComponentInteraction,
  APIModalSubmitInteraction,
  APIUser,
  MessageFlags,
} from "discord-api-types/v10";
import type { EditMessageOptions, MessageComponents } from "./messages.ts";

interface BaseInteractionMethods {
  reply: (data: InteractionReplyOptions) => Promise<void>;
  deferReply: (data?: DeferredReplyOptions) => Promise<void>;
  editReply: (data: EditMessageOptions) => Promise<void>;
  followUp: (data: InteractionReplyOptions) => Promise<void>;
  user: APIUser;
}

/**
 * A command interaction, includes methods for responding to the interaction.
 */
export type CommandInteraction =
  & APIApplicationCommandInteraction
  & BaseInteractionMethods
  & {
    showModal: (data: unknown) => Promise<void>;
  };

/**
 * A message component interaction, includes methods for responding to the interaction.
 */
export type MessageComponentInteraction =
  & APIMessageComponentInteraction
  & BaseInteractionMethods
  & {
    showModal: (data: unknown) => Promise<void>;
    update: (data: EditMessageOptions) => Promise<void>;
  };

/**
 * A modal submit interaction, includes methods for responding to the interaction.
 */
export type ModalSubmitInteraction =
  & APIModalSubmitInteraction
  & BaseInteractionMethods;

export interface DeferredReplyOptions {
  ephemeral?: boolean;
  flags?: MessageFlags[] | number;
}

export type InteractionReplyOptions =
  | {
    content?: string;
    ephemeral?: boolean;
    flags?: MessageFlags[] | number;
    embeds?: APIEmbed[];
    components?: MessageComponents;
  }
  | string;

export type Interaction<T extends APIInteraction> = T extends
  APIApplicationCommandInteraction ? CommandInteraction
  : T extends APIMessageComponentInteraction ? MessageComponentInteraction
  : T extends APIModalSubmitInteraction ? ModalSubmitInteraction
  : null;
