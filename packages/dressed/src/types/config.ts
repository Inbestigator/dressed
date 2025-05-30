import type {
  CommandInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "./interaction.ts";
import type {
  APIWebhookEventBody,
  ApplicationCommandType,
  InteractionContextType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
  RESTPostAPIPrimaryEntryPointApplicationCommandJSONBody,
} from "discord-api-types/v10";

/**
 * The configuration for the server.
 */
export interface ServerConfig {
  /** The endpoint to listen on, defaults to `/` */
  endpoint?: string;
  /** The port to listen on, defaults to `8000` */
  port?: number;
  /** Source root for the bot, defaults to `src` */
  root?: string;
}

type BaseCommandConfig = {
  /** Type of the command, defaults to `ChatInput` */
  type?: keyof typeof ApplicationCommandType;
  /** Interaction context(s) where the command can be used, only for globally-scoped commands. Defaults to all */
  contexts?: (keyof typeof InteractionContextType)[];
  /** Where a command can be installed, also called its supported installation context. Defaults to both */
  integration_type?: "Guild" | "User";
};

type CommandTypeConfig<T, K extends PropertyKey, A> = Omit<
  T,
  keyof BaseCommandConfig | "name" | K
> &
  A &
  BaseCommandConfig;

type ChatInputConfig = CommandTypeConfig<
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  0,
  { type?: "ChatInput" }
>;

type ContextMenuConfig = CommandTypeConfig<
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
  "options",
  {
    type: "Message" | "User";
  }
>;

type PrimaryEntryPointConfig = CommandTypeConfig<
  RESTPostAPIPrimaryEntryPointApplicationCommandJSONBody,
  "options",
  {
    type: "PrimaryEntryPoint";
  }
>;

/**
 * Configuration for a specific command.
 */
export type CommandConfig =
  | ChatInputConfig
  | ContextMenuConfig
  | PrimaryEntryPointConfig;

export interface BaseData<T> {
  name: string;
  path: string;
  uid: string;
  data: T;
  /** Externally provided only! */
  run?: (...args: unknown[]) => Promise<unknown>;
}

/**
 * Command data object in the `commands` array outputted from `build()`
 */
export interface CommandData {
  config?: CommandConfig;
}

/**
 * Component data object in the `components` array outputted from `build()`
 */
export interface ComponentData {
  regex: string;
  category: string;
  score: number;
}

/**
 * Event data object in the `events` array outputted from `build()`
 */
export interface EventData {
  type: string;
}

export type CommandHandler = (interaction: CommandInteraction) => Promise<void>;
export type ComponentHandler = (
  interaction: MessageComponentInteraction | ModalSubmitInteraction,
  args?: Record<string, string>,
) => Promise<void>;
export type EventHandler = (event: APIWebhookEventBody) => Promise<void>;
