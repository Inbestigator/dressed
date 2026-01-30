import type {
  ApplicationCommandType,
  InteractionContextType,
  PermissionFlagsBits,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
  RESTPostAPIPrimaryEntryPointApplicationCommandJSONBody,
  Snowflake,
} from "discord-api-types/v10";
import type { CallConfig } from "../utils/call-discord.ts";
import type { CommandHandler, ComponentHandler, EventHandler } from "./handlers.ts";
import type { Promisable } from "./utilities.ts";

/** Configuration for a server. */
export interface ServerConfig {
  /**
   * The endpoint to listen on
   * @default "/"
   */
  endpoint?: string;
  /**
   * The port to listen on
   * @default 8000
   */
  port?: number;
  /**
   * A layer before your individual handlers are executed.
   * The return values are the props passed to your handler.
   * @tip If you don't want to modify the handler's props, directly return the middleware's props.
   * @example
   * {
   *   // Passthroughed props
   *   commands(...props) {
   *     console.log("Middleware!")
   *     return props
   *   },
   *   // Modified props
   *   components: (interaction, args) => [patchInteraction(interaction), args]
   * }
   */
  middleware?: {
    commands?: (...p: Parameters<CommandHandler>) => Promisable<unknown[]>;
    components?: (...p: Parameters<ComponentHandler>) => Promisable<unknown[]>;
    events?: (...p: Parameters<EventHandler>) => Promisable<unknown[]>;
  };
}

/** Configuration for various Dressed services. */
export interface DressedConfig extends ServerConfig {
  /** Configuration for all API requests */
  requests?: CallConfig;
  /**
   * Suppress log levels
   * @example
   * "Warn" // Emit warnings and errors
   * "Error" // Only emit errors
   * false // Emit nothing
   */
  logger?: "Warn" | "Error" | false;
}

interface BaseCommandConfig {
  /**
   * Type of the command
   * @default "ChatInput"
   */
  type?: keyof typeof ApplicationCommandType;
  /**
   * Interaction context(s) where the command can be used, only for globally-scoped commands
   * @default ["Guild", "BotDM", "PrivateChannel"]
   */
  contexts?: (keyof typeof InteractionContextType)[];
  /**
   * Where a command can be installed, also called its supported installation context.
   * @default "Guild" & "User"
   */
  integration_type?: "Guild" | "User";
  /** The guilds this command is available in, this prop will cause the command to become guild-scoped */
  guilds?: Snowflake[];
  /** An array of permissions */
  default_member_permissions?: (keyof typeof PermissionFlagsBits)[] | string;
}

type CommandTypeConfig<T, K extends PropertyKey, A> = Omit<T, keyof BaseCommandConfig | "name" | K> &
  A &
  BaseCommandConfig;

export type ChatInputConfig = CommandTypeConfig<
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

/** Configuration for a specific command. */
export type CommandConfig = ChatInputConfig | ContextMenuConfig | PrimaryEntryPointConfig;

export interface BaseData<T, M extends object = object> {
  name: string;
  data: T;
  exports: M & { default: CallableFunction };
}

/** A standard command data object */
export type CommandData = BaseData<undefined, { autocomplete?: CallableFunction; config?: CommandConfig }>;

/** A standard component data object */
export type ComponentData = BaseData<{ regex: string; category: string; score: number }, { pattern?: string | RegExp }>;

/** A standard event data object */
export type EventData = BaseData<{ type: string }>;
