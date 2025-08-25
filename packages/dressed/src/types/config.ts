import type {
  ApplicationCommandType,
  InteractionContextType,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
  RESTPostAPIPrimaryEntryPointApplicationCommandJSONBody,
  Snowflake,
  PermissionFlagsBits,
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
     * @default ["js", "ts", "mjs"]
     */
    extensions: string[];
  }>;
  /**
   * A layer before your individual handlers are executed.
   * The return values are the props passed to your handler.
   *
   * If you don't want to modify the handler's props, directly return the middleware's props.
   *
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
  middleware: Partial<{
    commands: CommandMiddleware;
    components: ComponentMiddleware;
    events: EventMiddleware;
  }>;
}>;

interface BaseCommandConfig {
  /** Type of the command, defaults to `ChatInput` */
  type?: keyof typeof ApplicationCommandType;
  /** Interaction context(s) where the command can be used, only for globally-scoped commands. Defaults to all */
  contexts?: (keyof typeof InteractionContextType)[];
  /** Where a command can be installed, also called its supported installation context. Defaults to both */
  integration_type?: "Guild" | "User";
  /** The guilds this command is available in, this prop will cause the command to become guild-scoped */
  guilds?: Snowflake[];
  /** An array of permissions */
  default_member_permissions?: (keyof typeof PermissionFlagsBits)[] | string;
}

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => Promisable<unknown>;

export interface BaseData<T, M extends object = object> {
  name: string;
  path: string;
  uid: string;
  data: T;
  /** @deprecated Use the `default` key in `exports` instead (will be removed at the next major release) */
  run?: AnyFn; // TODO Remove before next major release
  exports: (M & { default: AnyFn }) | null;
}

/**
 * Command data object in the `commands` array outputted from `build()`
 */
export type CommandData = BaseData<
  { config?: CommandConfig },
  { autocomplete?: AnyFn; config?: CommandConfig }
>;

/**
 * Component data object in the `components` array outputted from `build()`
 */
export type ComponentData = BaseData<{
  regex: string;
  category: string;
  score: number;
}>;

/**
 * Event data object in the `events` array outputted from `build()`
 */
export type EventData = BaseData<{
  type: string;
}>;
