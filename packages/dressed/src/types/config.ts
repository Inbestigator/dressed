import type {
  CommandInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "./interaction.ts";
import type {
  APIWebhookEventBody,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
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

/**
 * Configuration for a specific command.
 */
export type CommandConfig = Omit<
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  "name" | "type" | "contexts" | "integration_types"
> & {
  /** Interaction context(s) where the command can be used, only for globally-scoped commands. Defaults to all */
  contexts?: ("Guild" | "Bot DM" | "Private channel")[];
  /** Where a command can be installed, also called its supported installation context. Defaults to both */
  integration_type?: "Guild" | "User";
};

/**
 * Command data object in the `commands` array outputted from `build()`
 */
export type CommandData<T extends "int" | "ext" = "int"> = {
  name: string;
  path: string;
} & (T extends "ext"
  ? {
      config: () => Promise<CommandConfig | undefined>;
      do: CommandHandler;
    }
  : object);

/**
 * Component data object in the `components` array outputted from `build()`
 */
export type ComponentData<T extends "int" | "ext" = "int"> = {
  name: string;
  regex: string;
  category: string;
  path: string;
} & (T extends "ext"
  ? {
      do: ComponentHandler;
    }
  : object);

/**
 * Event data object in the `events` array outputted from `build()`
 */
export type EventData<T extends "int" | "ext" = "int"> = {
  name: string;
  type: string;
  path: string;
} & (T extends "ext"
  ? {
      do: EventHandler;
    }
  : object);

export type CommandHandler = (interaction: CommandInteraction) => Promise<void>;
export type ComponentHandler = (
  interaction: MessageComponentInteraction | ModalSubmitInteraction,
  args?: Record<string, string>,
) => Promise<void>;
export type EventHandler = (event: APIWebhookEventBody) => Promise<void>;
