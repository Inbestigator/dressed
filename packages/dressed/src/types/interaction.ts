import type {
  APIApplicationCommandInteraction,
  APIChatInputApplicationCommandInteraction,
  APIInteraction,
  APIInteractionResponseCallbackData,
  APIMessage,
  APIMessageApplicationCommandInteraction,
  APIMessageComponentInteraction,
  APIModalInteractionResponseCallbackData,
  APIModalSubmitInteraction,
  APIPrimaryEntryPointCommandInteraction,
  APIUser,
  APIUserApplicationCommandInteraction,
  ApplicationCommandType,
  MessageFlags,
} from "discord-api-types/v10";
import type { OptionValueGetters } from "../server/extenders/options.ts";
import type { Buffer } from "node:buffer";

/** Type ripped from Discord.js (tysm) */
interface RawFile {
  /**
   * Content-Type of the file
   */
  contentType?: string;
  /**
   * The actual data for the file
   */
  data: Buffer | Uint8Array | boolean | number | string;
  /**
   * An explicit key to use for key of the formdata field for this file.
   * When not provided, the index of the file in the files array is used in the form `files[${index}]`.
   * If you wish to alter the placeholder snowflake, you must provide this property in the same form (`files[${placeholder}]`)
   */
  key?: string;
  /**
   * The name of the file
   */
  name: string;
}

/**
 * A command interaction, includes methods for responding to the interaction.
 */
export type CommandInteraction<
  T extends keyof typeof ApplicationCommandType = "ChatInput",
> = (T extends "ChatInput"
  ? APIChatInputApplicationCommandInteraction & {
      /**
       * Get an option from the interaction
       * @param name The name of the option
       * @param required Whether the option is required
       */
      getOption: <Required extends boolean>(
        name: string,
        required?: Required,
      ) => Required extends true
        ? NonNullable<OptionValueGetters>
        : OptionValueGetters | null;
    }
  : T extends "Message"
    ? APIMessageApplicationCommandInteraction
    : T extends "User"
      ? APIUserApplicationCommandInteraction
      : APIPrimaryEntryPointCommandInteraction) &
  Omit<BaseInteractionMethods, "update" | "deferUpdate">;

/**
 * A message component interaction, includes methods for responding to the interaction.
 */
export type MessageComponentInteraction = APIMessageComponentInteraction &
  BaseInteractionMethods;

/**
 * A modal submit interaction, includes methods for responding to the interaction.
 */
export type ModalSubmitInteraction = APIModalSubmitInteraction &
  Omit<BaseInteractionMethods, "showModal"> & {
    /**
     * Get a field from the user's submission
     * @param name The name of the field
     * @param required Whether the field is required
     */
    getField: <Required extends boolean>(
      name: string,
      required?: Required,
    ) => Required extends true ? NonNullable<string> : string | null;
  };

export interface BaseInteractionMethods {
  /**
   * Respond to an interaction with a message
   * @param data The response message
   */
  reply: (
    data:
      | string
      | (APIInteractionResponseCallbackData & {
          /** Whether the message is ephemeral */
          ephemeral?: boolean;
          /** The files to send with the message */
          files?: RawFile[];
          /** Whether to return the source message with the response */
          with_response?: boolean;
        }),
  ) => Promise<null | APIMessage>;
  /**
   * ACK an interaction and edit a response later, the user sees a loading state
   * @param data Optional data for the deferred response
   */
  deferReply: (data?: {
    /** Whether the message is ephemeral */
    ephemeral?: boolean;
    /** Message flags combined as a bitfield */
    flags?: MessageFlags;
    /** Whether to return the source message with the response */
    with_response?: boolean;
  }) => Promise<null | APIMessage>;

  /**
   * For components, edit the message the component was attached to
   * @param data The new data for the component message
   */
  update: (
    data: string | (APIInteractionResponseCallbackData & { files?: RawFile[] }),
  ) => Promise<void>;

  /**
   * For components, ACK an interaction and edit the original message later; the user does not see a loading state
   */
  deferUpdate: () => Promise<void>;

  /**
   * Edit the initial interaction response
   * @param data The new data for the response message
   */
  editReply: (
    data:
      | string
      | (APIInteractionResponseCallbackData & {
          /** The files to send with the message */
          files?: RawFile[];
        }),
  ) => Promise<void>;
  /**
   * Create another response to the interaction
   * @param data The data for the message
   */
  followUp: (
    data:
      | string
      | (APIInteractionResponseCallbackData & {
          /** The files to send with the message */
          files?: RawFile[];
          /** Whether the message is ephemeral */
          ephemeral?: boolean;
        }),
  ) => Promise<void>;
  /**
   * Respond to an interaction with a popup modal
   * @param data The data for the modal response
   */
  showModal: (data: APIModalInteractionResponseCallbackData) => Promise<void>;
  /**
   *
   * **IGNORE PREVIOUS**:
   * Invoking user should be filled in for every interaction */
  user: APIUser;
}

export type Interaction<T extends APIInteraction> =
  T extends APIApplicationCommandInteraction
    ? CommandInteraction
    : T extends APIMessageComponentInteraction
      ? MessageComponentInteraction
      : T extends APIModalSubmitInteraction
        ? ModalSubmitInteraction
        : null;
