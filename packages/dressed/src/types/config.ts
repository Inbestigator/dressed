import type {
  APIInteraction,
  APIWebhookEvent,
  ApplicationCommandType,
  InteractionContextType,
  PermissionFlagsBits,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
  RESTPostAPIPrimaryEntryPointApplicationCommandJSONBody,
  Snowflake,
} from "discord-api-types/v10";
import { createServer } from "../server/server.ts";
import type { CallConfig } from "../utils/call-discord.ts";
import type { CommandHandler, ComponentHandler, EventHandler } from "./handlers.ts";
import type { Promisable } from "./utilities.ts";

/** Configuration for {@link createServer}. */
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
}

/** Configuration for various Dressed services. */
export interface DressedConfig {
  /** Configuration for {@link createServer}. */
  server?: ServerConfig;
  /** Configuration for all API requests. */
  requests?: CallConfig;
  observability?: {
    /**
     * Suppress log levels
     * @example
     * "Warn" // Emit warnings and errors
     * "Error" // Only emit errors
     * false // Emit nothing
     */
    logger?: "Warn" | "Error" | false;
    /**
     * A layer before your command handlers are executed.
     * @important The return values of this function will be the props passed to your handler.
     * @tip If you don't want to modify the handler's props, either directly return the input props or undefined.
     */
    onBeforeCommand?: (...p: Parameters<CommandHandler>) => Promisable<unknown[]>;
    /**
     * A layer before your component handlers are executed.
     * @important The return values of this function will be the props passed to your handler.
     * @tip If you don't want to modify the handler's props, either directly return the input props or undefined.
     */
    onBeforeComponent?: (...p: Parameters<ComponentHandler>) => Promisable<unknown[]>;
    /**
     * A layer before your event handlers are executed.
     * @important The return values of this function will be the props passed to your handler.
     * @tip If you don't want to modify the handler's props, either directly return the input props or undefined.
     */
    onBeforeEvent?: (...p: Parameters<EventHandler>) => Promisable<unknown[]>;
    /**
     * Executed right before calling the API, this runs after ratelimit delays happen.
     * @important The return value of this function will be used as the request in the {@link fetch}.
     * @tip If you don't want to modify the request, either directly return the input or undefined.
     */
    onBeforeFetch?: (req: Readonly<Request>) => Promisable<Request>;
    /** Executed after the API returns a response. */
    onCallResponse?: (res: Readonly<Response>) => unknown;
    onError?: (error: unknown) => unknown;
    /** Executed before an incoming interaction is handled. */
    onServerEvent?: (event: APIWebhookEvent) => unknown;
    /** Executed before an incoming interaction is handled. */
    onServerInteraction?: (interaction: Readonly<APIInteraction>) => unknown;
    /** Executed on an incoming request to the bot server. */
    onServerRequest?: (res: Readonly<Request>) => unknown;
    /** Executed when the bot server finishes processing an incoming request. */
    onServerResponded?: (res: Readonly<Response>) => unknown;
  };
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
