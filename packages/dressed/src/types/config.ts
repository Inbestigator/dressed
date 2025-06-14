import type {
  ApplicationCommandType,
  InteractionContextType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
  RESTPostAPIPrimaryEntryPointApplicationCommandJSONBody,
} from "discord-api-types/v10";
import type { Promisable } from "./possible-promise.ts";
import type {
  CommandHandler,
  ComponentHandler,
  EventHandler,
} from "./handlers.ts";

export type CommandMiddleware = (
  ...p: Parameters<CommandHandler>
) => Promisable<unknown[]>;
export type ComponentMiddleware = (
  ...p: Parameters<ComponentHandler>
) => Promisable<unknown[]>;
export type EventMiddleware = (
  ...p: Parameters<EventHandler>
) => Promisable<unknown[]>;

/**
 * The configuration for the server.
 */
export type ServerConfig = Partial<{
  /** The endpoint to listen on
   * @default "/"
   */
  endpoint: string;
  /** The port to listen on
   * @default 8000
   */
  port: number;
  /** Build configuration */
  build: Partial<{
    /** Source root for the bot
     * @default "src"
     */
    root: string;
    /** File extensions to include when bundling handlers
     * @default [".js", ".ts", ".mjs"]
     */
    extensions: string[];
  }>;
  /** A layer before your individual handlers are executed.
   * The return values are the props passed to your handler.
   *
   * If you want to passthrough instead of modifying the handler's props, return the middleware's props
   * ```ts
   * {
   *   middleware: {
   *     // Passthroughed props
   *     commands(...props) {
   *       console.log("Middleware!")
   *       return props
   *     },
   *     // Modified props
   *     components: (interaction, args) => [patchInteraction(interaction), args]
   *   }
   * }
   * ``` */
  middleware: Partial<{
    commands: CommandMiddleware;
    components: ComponentMiddleware;
    events: EventMiddleware;
  }>;
}>;

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
