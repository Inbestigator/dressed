import type {
  APIInteraction,
  APIWebhookEventBody,
  ApplicationCommandType,
  InteractionContextType,
  PermissionFlagsBits,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
  RESTPostAPIPrimaryEntryPointApplicationCommandJSONBody,
  Snowflake,
} from "discord-api-types/v10";
import { createServer } from "../server/server.ts";
import type { botEnv } from "../utils/env.ts";
import type { CommandHandler, ComponentHandler, EventHandler } from "./handlers.ts";
import type { Promisable } from "./utilities.ts";

/** Optional extra config for the layer before fetch */
export interface CallConfig {
  /**
   * The authorization string to use
   * @default `Bot {env.DISCORD_TOKEN}`
   */
  authorization?: string;
  /**
   * Number of retries when rate limited before the caller gives up
   * @default 3
   */
  tries?: number;
  /**
   * The location which endpoints branch off from
   * @default "https://discord.com/api/v10"
   */
  routeBase?: string;
  /**
   * Environment variables to use
   * @default {botEnv}
   */
  env?: Partial<typeof botEnv>;
  /**
   * Delay in seconds before old ratelimit buckets are purged from the cache, set to -1 to disable
   * @default 1,800 // 30 minutes
   */
  bucketTTL?: number;
  hooks?: {
    /**
     * Executed before calling the API, this runs before ratelimit delays happen.
     * @important The return value of this function will be used as the {@link Request} object in the {@link fetch}.
     * @tip If you don't want to modify the request, either directly return the input or `undefined`.
     */
    onBeforeFetch?: (req: Readonly<Request>) => Promisable<Request | undefined>;
    /** Executed before calling the API. {@link res} will resolve with the API response upon completion. */
    onFetch?: (req: Readonly<Request>, res: Readonly<Promise<Response>>) => unknown;
  };
}

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
  hooks?: {
    /**
     * A layer before your command handlers are executed.
     * @important The return values of this function will be the props passed to your handler.
     * @tip If you don't want to modify the handler's props, either directly return the input props or `undefined`.
     */
    onBeforeCommand?: (...p: Parameters<CommandHandler>) => Promisable<unknown[] | undefined>;
    /**
     * A layer before your component handlers are executed.
     * @important The return values of this function will be the props passed to your handler.
     * @tip If you don't want to modify the handler's props, either directly return the input props or `undefined`.
     */
    onBeforeComponent?: (...p: Parameters<ComponentHandler>) => Promisable<unknown[] | undefined>;
    /**
     * A layer before your event handlers are executed.
     * @important The return values of this function will be the props passed to your handler.
     * @tip If you don't want to modify the handler's props, either directly return the input props or `undefined`.
     */
    onBeforeEvent?: (...p: Parameters<EventHandler>) => Promisable<unknown[] | undefined>;
    /** Executed when no command/component handler is found for the incoming interaction */
    onUnknownInteraction?: (interaction: APIInteraction) => unknown;
    /** Executed when no event handler is found for the incoming event */
    onUnknownEvent?: (event: APIWebhookEventBody) => unknown;
    /** Executed before an incoming request to the bot server is handled. {@link res} will resolve with the server's response upon handling. */
    onServerRequest?: (req: Readonly<Request>, res: Readonly<Promise<Response>>) => unknown;
  };
}

/** Configuration for various Dressed services. */
export interface DressedConfig {
  /** Configuration for all API requests. */
  requests?: Omit<CallConfig, "hooks">;
  /** Configuration for {@link createServer}. */
  server?: Omit<ServerConfig, "hooks">;
  /**
   * Suppress log levels
   * @example
   * "Warn" // Emit warnings and errors
   * "Error" // Only emit errors
   * false // Emit nothing
   */
  logger?: "Warn" | "Error" | false;
  hooks?: CallConfig["hooks"] & ServerConfig["hooks"] & { onError?: (error: unknown) => unknown };
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
