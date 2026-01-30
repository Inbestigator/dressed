import type {
  APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandBasicOption,
  APIApplicationCommandInteraction,
  APIApplicationCommandOption,
  APIApplicationCommandSubcommandOption,
  APIAttachment,
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
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ComponentType,
  InteractionResponseType,
  RESTPostAPIInteractionCallbackQuery,
  RESTPostAPIInteractionCallbackWithResponseResult,
} from "discord-api-types/v10";
import type { editWebhookMessage, executeWebhook } from "../resources/generated.resources.ts";
import type { createInteractionCallback } from "../resources/interactions.ts";
import type { getField } from "../server/extenders/fields.ts";
import type { CallConfig } from "../utils/call-discord.ts";
import type { ChatInputConfig, CommandConfig } from "./config.ts";
import type { RawFile } from "./file.ts";
import type { Requirable } from "./utilities.ts";

export type InteractionCallbackResponse<O extends RESTPostAPIInteractionCallbackQuery> = Promise<
  O["with_response"] extends true ? RESTPostAPIInteractionCallbackWithResponseResult : null
>;

type OptionValue<P extends APIApplicationCommandOption, R = true> = [
  never,
  {
    /**
     * The key provided to the command config
     * @example
     * export const config = {
     *   options: [
     *     CommandOption({ type: "Subcommand", name: "foo" }),
     *     CommandOption({ type: "Subcommand", name: "bar" }),
     *   ],
     * } satisfies CommandConfig;
     * const { options }: CommandInteraction<typeof config>;
     * const subcommand = options.foo ?? options.bar;
     * if (subcommand?.name === "foo") {
     *   console.log("Bar");
     * } else {
     *   console.log("Bar");
     * }
     */
    name: P extends { name: infer N } ? N : never;
    /** Subcommand options provided by the user */
    options: MapOptions<P extends { options: APIApplicationCommandBasicOption[] } ? P["options"] : [], R>;
  },
  {
    /** The key provided to the command config */
    name: P extends { name: infer N } ? N : never;
    /** Subcommand group subcommand selected by the user */
    subcommands: MapOptions<P extends { options: APIApplicationCommandSubcommandOption[] } ? P["options"] : [], R>;
  },
  string,
  number,
  boolean,
  APIUser,
  APIInteractionDataResolvedChannel,
  APIRole,
  APIUser | APIRole,
  number,
  APIAttachment,
][P["type"]];

export type MapOptions<T extends APIApplicationCommandOption[], R = true> = {
  [P in T[number] as P["name"]]: Requirable<P["required"] extends R ? true : false, OptionValue<P, R>>;
};

type CommandOption<T = ApplicationCommandOptionType> = T extends
  | ApplicationCommandOptionType.Subcommand
  | ApplicationCommandOptionType.SubcommandGroup
  ? Omit<Extract<APIApplicationCommandOption, { type: T }>, "options"> & {
      options: CommandOption<
        T extends ApplicationCommandOptionType.SubcommandGroup
          ? ApplicationCommandOptionType.Subcommand
          : Exclude<
              ApplicationCommandOptionType,
              ApplicationCommandOptionType.Subcommand | ApplicationCommandOptionType.SubcommandGroup
            >
      >[];
    }
  : Extract<APIApplicationCommandOption, { type: T }>;

/**
 * The resolved value of a standalone application command option.
 * @remark It's encouraged to pass your config into the {@link CommandInteraction}'s generic
 * instead of manually adding type casts
 * @example
 * const user = interaction.options.user as CommandOptionValue<"User">;
 * //    ^? const user: APIUser | undefined
 */
export type CommandOptionValue<
  T extends keyof typeof ApplicationCommandOptionType = keyof typeof ApplicationCommandOptionType,
  R extends boolean = false,
> = Requirable<R, OptionValue<CommandOption<(typeof ApplicationCommandOptionType)[T]>>>;

/** A command interaction, includes methods for responding to the interaction. */
export type CommandInteraction<T extends keyof typeof ApplicationCommandType | CommandConfig = "ChatInput"> = (T extends
  | "ChatInput"
  | Extract<CommandConfig, { type?: "ChatInput" }>
  ? APIChatInputApplicationCommandInteraction & {
      /**
       * Resolved command options provided by the user.
       * @example
       * export const config = {
       *   options: [CommandOption({ type: "User", name: "user" })],
       * } satisfies CommandConfig;
       * const interaction: CommandInteraction<typeof config>;
       * const { user } = interaction.options;
       * //      ^? const user: APIUser | undefined
       */
      options: MapOptions<
        T extends object ? (T extends { options: APIApplicationCommandOption[] } ? T["options"] : []) : CommandOption[]
      >;
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
export type CommandAutocompleteInteraction<T extends ChatInputConfig | undefined = undefined> =
  APIApplicationCommandAutocompleteInteraction & {
    /**
     * Resolved command options provided by the user.
     * @important All options are possibly undefined within an autocomplete interaction
     * @example
     * export const config = {
     *   options: [CommandOption({ type: "String", name: "reason", autocomplete: true, required: true })],
     * } satisfies CommandConfig;
     * const interaction: CommandAutocompleteInteraction<typeof config>;
     * const { reason } = interaction.options;
     * //      ^? const reason: string | undefined
     */
    options: MapOptions<
      T extends object ? (T extends { options: APIApplicationCommandOption[] } ? T["options"] : []) : CommandOption[],
      never
    >;
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
           * Resolved values from the user's selections
           * @warn Only available on select menus
           */
          values: ResolvedSelectValues[T extends keyof ResolvedSelectValues ? T : keyof ResolvedSelectValues];
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
