import type {
  APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandInteraction,
  APIChatInputApplicationCommandInteraction,
  APIInteraction,
  APIInteractionDataResolvedGuildMember,
  APIMessage,
  APIMessageApplicationCommandInteraction,
  APIMessageComponentInteraction,
  APIModalSubmitInteraction,
  APIPrimaryEntryPointCommandInteraction,
  APIUser,
  APIUserApplicationCommandInteraction,
  ApplicationCommandType,
  InteractionResponseType,
  RESTPostAPIInteractionCallbackQuery,
  RESTPostAPIInteractionCallbackWithResponseResult,
} from "discord-api-types/v10";
import type { editWebhookMessage, executeWebhook } from "../resources/generated.resources.ts";
import type { createInteractionCallback } from "../resources/interactions.ts";
import type { getField } from "../server/extenders/fields.ts";
import type { getOption, OptionValueGetters } from "../server/extenders/options.ts";
import type { RawFile } from "./file.ts";

export type InteractionCallbackResponse<O extends RESTPostAPIInteractionCallbackQuery> = Promise<
  O["with_response"] extends true ? RESTPostAPIInteractionCallbackWithResponseResult : null
>;

/**
 * A command interaction, includes methods for responding to the interaction.
 */
export type CommandInteraction<T extends keyof typeof ApplicationCommandType = "ChatInput"> = (T extends "ChatInput"
  ? APIChatInputApplicationCommandInteraction & {
      /**
       * Get an option from the interaction
       * @param name The name of the option
       * @param required Whether the option is required
       */
      getOption: <N extends string, R extends boolean>(name: N, required?: R) => ReturnType<typeof getOption<N, R>>;
    }
  : T extends "Message"
    ? APIMessageApplicationCommandInteraction & { target: APIMessage }
    : T extends "User"
      ? APIUserApplicationCommandInteraction & { target: APIUser & { member?: APIInteractionDataResolvedGuildMember } }
      : APIPrimaryEntryPointCommandInteraction) &
  Omit<BaseInteractionMethods, "update" | "deferUpdate" | "sendChoices">;

/**
 * A command autocomplete interaction, includes methods for responding to the interaction.
 */
export type CommandAutocompleteInteraction = APIApplicationCommandAutocompleteInteraction & {
  /**
   * Get an option from the interaction
   * @param name The name of the option
   */
  getOption: <N extends string>(name: N) => OptionValueGetters<N> | undefined;
} & Omit<
    BaseInteractionMethods,
    "deferReply" | "deferUpdate" | "editReply" | "followUp" | "reply" | "showModal" | "update"
  >;

/**
 * A message component interaction, includes methods for responding to the interaction.
 */
export type MessageComponentInteraction = APIMessageComponentInteraction & Omit<BaseInteractionMethods, "sendChoices">;

/**
 * A modal submit interaction, includes methods for responding to the interaction.
 */
export type ModalSubmitInteraction = APIModalSubmitInteraction &
  Omit<BaseInteractionMethods, "showModal" | "sendChoices"> & {
    /**
     * Get a field from the user's submission
     * @param custom_id The custom_id of the field
     * @param required Whether the field is required
     *
     * **The returned string is deprecated, use `.textInput()` to fetch the value of a text input in the future**
     */
    getField: <R extends boolean>(custom_id: string, required?: R) => ReturnType<typeof getField<R>>;
  };

type InteractionResponseCallbackData<T extends keyof typeof InteractionResponseType> = Parameters<
  typeof createInteractionCallback<T, object>
>[3];

export interface BaseInteractionMethods {
  /**
   * Respond to an interaction with a message
   * @param data The response message
   */
  reply: <Q extends RESTPostAPIInteractionCallbackQuery>(
    data:
      | string
      | (InteractionResponseCallbackData<"ChannelMessageWithSource"> & {
          /** Whether the message is ephemeral */
          ephemeral?: boolean;
          /** The files to send with the message */
          files?: RawFile[];
        } & Q),
  ) => InteractionCallbackResponse<Q>;
  /**
   * ACK an interaction and edit a response later, the user sees a loading state
   * @param data Optional data for the deferred response
   */
  deferReply: <Q extends RESTPostAPIInteractionCallbackQuery>(
    data?: InteractionResponseCallbackData<"DeferredChannelMessageWithSource"> & {
      /** Whether the message is ephemeral */
      ephemeral?: boolean;
    } & Q,
  ) => InteractionCallbackResponse<Q>;

  /**
   * For components, edit the message the component was attached to
   * @param data The new data for the component message
   */
  update: <Q extends RESTPostAPIInteractionCallbackQuery>(
    data:
      | string
      | (InteractionResponseCallbackData<"UpdateMessage"> & {
          /** The files to send with the message */
          files?: RawFile[];
        } & Q),
  ) => InteractionCallbackResponse<Q>;

  /**
   * For components, ACK an interaction and edit the original message later; the user does not see a loading state
   */
  deferUpdate: <Q extends RESTPostAPIInteractionCallbackQuery>(options?: Q) => InteractionCallbackResponse<Q>;

  /**
   * Edit the initial interaction response
   * @param data The new data for the response message
   */
  editReply: (data: Parameters<typeof editWebhookMessage>[3]) => Promise<APIMessage>;
  /**
   * Create another response to the interaction
   * @param data The data for the message
   */
  followUp: (
    data: Parameters<typeof executeWebhook>[2] & {
      /** Whether the message is ephemeral */
      ephemeral?: boolean;
      /** The files to send with the message */
      files?: RawFile[];
    },
  ) => Promise<APIMessage>;
  /**
   * Respond to an interaction with a popup modal
   * @param data The data for the modal response
   */
  showModal: <Q extends RESTPostAPIInteractionCallbackQuery>(
    data: InteractionResponseCallbackData<"Modal">,
    options?: Q,
  ) => InteractionCallbackResponse<Q>;
  /**
   * Respond to an autocomplete interaction with suggested choices
   * @param choices The choices to suggest
   */
  sendChoices: <Q extends RESTPostAPIInteractionCallbackQuery>(
    choices?: InteractionResponseCallbackData<"ApplicationCommandAutocompleteResult">["choices"],
    options?: Q,
  ) => InteractionCallbackResponse<Q>;
  /**
   *
   * **IGNORE PREVIOUS**:
   * Invoking user should be filled in for every interaction */
  user: APIUser;
}

export type Interaction<T extends APIInteraction> = T extends APIApplicationCommandInteraction
  ? CommandInteraction
  : T extends APIApplicationCommandAutocompleteInteraction
    ? CommandAutocompleteInteraction
    : T extends APIMessageComponentInteraction
      ? MessageComponentInteraction
      : T extends APIModalSubmitInteraction
        ? ModalSubmitInteraction
        : null;
