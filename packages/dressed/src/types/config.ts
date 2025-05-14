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
 * Command data object in the `commandData` array outputted from `build()`
 */
export type CommandData = {
  name: string;
  path: string;
};

/**
 * Component data object in the `componentData` array outputted from `build()`
 */
export type ComponentData = {
  name: string;
  regex: string;
  category: string;
  path: string;
};

/**
 * Event data object in the `eventData` array outputted from `build()`
 */
export type EventData = {
  name: string;
  type: string;
  path: string;
};

export type CommandHandler = (interaction: CommandInteraction) => Promise<void>;
export type ComponentHandler = (
  interaction: MessageComponentInteraction | ModalSubmitInteraction,
  args?: Record<string, string>,
) => Promise<void>;
export type EventHandler = (event: APIWebhookEventBody) => Promise<void>;
