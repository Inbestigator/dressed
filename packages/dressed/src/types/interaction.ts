import type {
  APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandInteraction,
  APIChatInputApplicationCommandInteraction,
  APIInteraction,
  APIInteractionDataResolvedChannel,
  APIInteractionDataResolvedGuildMember,
  APIMessage,
  APIMessageApplicationCommandInteraction,
  APIMessageComponentInteraction,
  APIModalSubmitInteraction,
  APIPrimaryEntryPointCommandInteraction,
  APIRole,
  APIUser,
  APIUserApplicationCommandInteraction,
  ApplicationCommandType,
  ComponentType,
  InteractionResponseType,
  RESTPostAPIInteractionCallbackQuery,
  RESTPostAPIInteractionCallbackWithResponseResult,
} from "discord-api-types/v10";
import type { editWebhookMessage, executeWebhook } from "../resources/generated.resources.ts";
import type { createInteractionCallback } from "../resources/interactions.ts";
import type { getField } from "../server/extenders/fields.ts";
import type { getOption, OptionValueGetters } from "../server/extenders/options.ts";
import type { CallConfig } from "../utils/call-discord.ts";
import type { CommandConfig } from "./config.ts";
import type { RawFile } from "./file.ts";
import type { Requirable } from "./utilities.ts";

export type InteractionCallbackResponse<O extends RESTPostAPIInteractionCallbackQuery> = Promise<
  O["with_response"] extends true ? RESTPostAPIInteractionCallbackWithResponseResult : null
>;

export type GetOptionFn<T extends Extract<CommandConfig, { type?: "ChatInput" }>> = <
  N extends NonNullable<T["options"]>[number]["name"],
  R extends boolean,
  O extends Extract<NonNullable<T["options"]>[number], { name: N }>,
>(
  name: N,
  ...[required]: O["required"] extends true ? [R] : [R?]
) => Requirable<
  R,
  Pick<
    OptionValueGetters<N, { options: O extends { options: unknown[] } ? O["options"] : [] }>,
    // biome-ignore format: These don't need individual lines
    NonNullable<["", "subcommand", "subcommandGroup", "string", "integer", "boolean", "user", "channel", "role", "mentionable", "number", "attachment"][O["type"]]>
  >
>;

/**
 * A command interaction, includes methods for responding to the interaction.
 */
export type CommandInteraction<T extends keyof typeof ApplicationCommandType | CommandConfig = "ChatInput"> = (T extends
  | "ChatInput"
  | Extract<CommandConfig, { type?: "ChatInput" }>
  ? APIChatInputApplicationCommandInteraction & {
      /**
       * Get an option from the interaction
       * @param name The name of the option
       * @param required Whether the option is required
       */
      getOption: T extends object
        ? GetOptionFn<T>
        : <N extends string, R extends boolean>(name: N, required?: R) => ReturnType<typeof getOption<N, R>>;
    }
  : T extends "Message" | { type: "Message" }
    ? APIMessageApplicationCommandInteraction & { target: APIMessage }
    : T extends "User" | { type: "User" }
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

interface ResolvedSelectValues {
  StringSelect: string[];
  UserSelect: APIUser[];
  RoleSelect: APIRole[];
  MentionableSelect: (APIInteractionDataResolvedGuildMember | APIUser)[];
  ChannelSelect: APIInteractionDataResolvedChannel[];
}

/**
 * A message component interaction, includes methods for responding to the interaction.
 */
export type MessageComponentInteraction<T extends "Button" | keyof ResolvedSelectValues | undefined = undefined> =
  APIMessageComponentInteraction &
    Omit<BaseInteractionMethods, "sendChoices"> & {
      data: { component_type: T extends string ? (typeof ComponentType)[T] : unknown };
    } & (T extends keyof ResolvedSelectValues | undefined
      ? {
          /**
           * Get the resolved values from the user's selections
           * @warn Only available on select menus
           */
          getValues: () => ResolvedSelectValues[T extends keyof ResolvedSelectValues ? T : keyof ResolvedSelectValues];
        }
      : unknown);

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
    $req?: CallConfig,
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
    $req?: CallConfig,
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
    $req?: CallConfig,
  ) => InteractionCallbackResponse<Q>;

  /**
   * For components, ACK an interaction and edit the original message later; the user does not see a loading state
   */
  deferUpdate: <Q extends RESTPostAPIInteractionCallbackQuery>(
    params?: Q,
    $req?: CallConfig,
  ) => InteractionCallbackResponse<Q>;

  /**
   * Edit the initial interaction response
   * @param data The new data for the response message
   */
  editReply: (data: Parameters<typeof editWebhookMessage>[3], $req?: CallConfig) => Promise<APIMessage>;
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
    $req?: CallConfig,
  ) => Promise<APIMessage>;
  /**
   * Respond to an interaction with a popup modal
   * @param data The data for the modal response
   */
  showModal: <Q extends RESTPostAPIInteractionCallbackQuery>(
    data: InteractionResponseCallbackData<"Modal">,
    params?: Q,
    $req?: CallConfig,
  ) => InteractionCallbackResponse<Q>;
  /**
   * Respond to an autocomplete interaction with suggested choices
   * @param choices The choices to suggest
   */
  sendChoices: <Q extends RESTPostAPIInteractionCallbackQuery>(
    choices?: InteractionResponseCallbackData<"ApplicationCommandAutocompleteResult">["choices"],
    params?: Q,
    $req?: CallConfig,
  ) => InteractionCallbackResponse<Q>;
  /**
   *
   * **IGNORE PREVIOUS**:
   * Invoking user should be filled in for every interaction */
  user: APIUser;
  history: (keyof Omit<BaseInteractionMethods, "user" | "history">)[];
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
