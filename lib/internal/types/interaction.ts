import type {
  APIApplicationCommandInteraction,
  APIInteraction,
  APIMessageComponentInteraction,
  APIModalSubmitInteraction,
} from "discord-api-types/v10";

/**
 * A command interaction, includes methods for responding to the interaction.
 */
export type CommandInteraction = APIApplicationCommandInteraction & {
  reply: (data: InteractionReplyOptions) => Promise<void>;
  deferReply: (data?: DeferredReplyOptions) => Promise<void>;
  showModal: (data: unknown) => Promise<void>;
  followUp: (data: InteractionReplyOptions) => Promise<void>;
};

/**
 * A message component interaction, includes methods for responding to the interaction.
 */
export type MessageComponentInteraction = APIMessageComponentInteraction & {
  reply: (data: InteractionReplyOptions) => Promise<void>;
  deferReply: (data: DeferredReplyOptions) => Promise<void>;
  showModal: (data: unknown) => Promise<void>;
  followUp: (data: InteractionReplyOptions) => Promise<void>;
};

/**
 * A modal submit interaction, includes methods for responding to the interaction.
 */
export type ModalSubmitInteraction = APIModalSubmitInteraction & {
  reply: (data: InteractionReplyOptions) => Promise<void>;
  deferReply: (data: DeferredReplyOptions) => Promise<void>;
  followUp: (data: InteractionReplyOptions) => Promise<void>;
};

export interface DeferredReplyOptions {
  ephemeral?: boolean;
}

export type InteractionReplyOptions =
  | {
    content?: string;
    ephemeral?: boolean;
  }
  | string;

export type Interaction<T extends APIInteraction> = T extends
  APIApplicationCommandInteraction ? CommandInteraction
  : T extends APIMessageComponentInteraction ? MessageComponentInteraction
  : T extends APIModalSubmitInteraction ? ModalSubmitInteraction
  : null;
