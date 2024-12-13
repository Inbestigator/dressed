import type {
  APIApplicationCommandInteraction,
  APIInteraction,
  APIInteractionResponseCallbackData,
  APIMessageComponentInteraction,
  APIModalInteractionResponseCallbackData,
  APIModalSubmitInteraction,
  APIUser,
  MessageFlags,
} from "discord-api-types/v10";
import type { MessageOptions } from "./messages.ts";
import type { OptionReaders } from "../options.ts";

export interface BaseInteractionMethods {
  /**
   * Respond to an interaction with a message
   * @param data The response message
   */
  reply: (data: InteractionReplyOptions) => Promise<void>;
  /**
   * ACK an interaction and edit a response later, the user sees a loading state
   * @param data Optional data for the deferred response
   */
  deferReply: (data?: DeferredReplyOptions) => Promise<void>;
  /**
   * Edit the initial interaction response
   * @param data The new data for the response message
   */
  editReply: (data: MessageOptions) => Promise<void>;
  /**
   * Create another response to the interaction
   * @param data The data for the message
   */
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
    /**
     * Respond to an interaction with a popup modal
     * @param data TODO
     */
    showModal: (data: APIModalInteractionResponseCallbackData) => Promise<void>; // TODO
    /**
     * Get an option from the interaction
     * @param name The name of the option
     * @param required Whether the option is required
     */
    getOption: <Required extends boolean>(
      name: string,
      required?: Required,
    ) => Required extends true ? NonNullable<OptionReaders>
      : OptionReaders | null;
  };

/**
 * A message component interaction, includes methods for responding to the interaction.
 */
export type MessageComponentInteraction =
  & APIMessageComponentInteraction
  & BaseInteractionMethods
  & {
    /**
     * Respond to an interaction with a popup modal
     * @param data TODO
     */
    showModal: (data: APIModalInteractionResponseCallbackData) => Promise<void>; // TODO
    /**
     * For components, edit the message the component was attached to
     * @param data The new data for the component message
     */
    update: (data: MessageOptions) => Promise<void>;
  };

/**
 * A modal submit interaction, includes methods for responding to the interaction.
 */
export type ModalSubmitInteraction =
  & APIModalSubmitInteraction
  & BaseInteractionMethods;

export interface DeferredReplyOptions {
  ephemeral?: boolean;
  flags?: MessageFlags;
}

export type InteractionReplyOptions =
  | (APIInteractionResponseCallbackData & {
    ephemeral?: boolean;
  })
  | string;

export type Interaction<T extends APIInteraction> = T extends
  APIApplicationCommandInteraction ? CommandInteraction
  : T extends APIMessageComponentInteraction ? MessageComponentInteraction
  : T extends APIModalSubmitInteraction ? ModalSubmitInteraction
  : null;
