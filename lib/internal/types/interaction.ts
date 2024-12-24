import type {
  APIApplicationCommandInteraction,
  APIInteraction,
  APIInteractionResponseCallbackData,
  APIMessageComponentInteraction,
  APIModalInteractionResponseCallbackData,
  APIModalSubmitInteraction,
  APIUser,
  MessageFlags,
  RESTPatchAPIWebhookWithTokenMessageJSONBody,
} from "discord-api-types/v10";
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
  editReply: (
    data: string | RESTPatchAPIWebhookWithTokenMessageJSONBody,
  ) => Promise<void>;
  /**
   * Create another response to the interaction
   * @param data The data for the message
   */
  followUp: (data: InteractionReplyOptions) => Promise<void>;
  /**
   * Respond to an interaction with a popup modal
   * @param data The data for the modal response
   */
  showModal: (data: APIModalInteractionResponseCallbackData) => Promise<void>;
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
     * For components, edit the message the component was attached to
     * @param data The new data for the component message
     */
    update: (
      data: string | APIInteractionResponseCallbackData,
    ) => Promise<void>;
  };

/**
 * A modal submit interaction, includes methods for responding to the interaction.
 */
export type ModalSubmitInteraction =
  & APIModalSubmitInteraction
  & Omit<BaseInteractionMethods, "showModal">
  & {
    /**
     * Get a field from the user's submission
     * @param name The name of the field
     * @param required Whether the field is required
     */
    getField: <Required extends boolean>(
      name: string,
      required?: Required,
    ) => Required extends true ? NonNullable<string>
      : string | null;
  };

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
