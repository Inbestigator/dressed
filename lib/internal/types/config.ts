import type {
  CommandInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "./interaction.ts";
import type {
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
export type CommandConfig =
  & Omit<
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    "name" | "type" | "contexts" | "integration_types"
  >
  & {
    /** Interaction context(s) where the command can be used, only for globally-scoped commands. Defaults to all */
    contexts?: ("Guild" | "Bot DM" | "Private channel")[];
    /** Where a command can be installed, also called its supported installation context. Defaults to both */
    integration_type?: "Guild" | "User";
  };
export interface Command {
  name: string;
  import: () => Promise<{
    config?: CommandConfig;
    default: CommandHandler;
  }>;
}

export interface BuildCommand {
  name: string;
  path: string;
}

export interface Component {
  name: string;
  import: () => Promise<{
    default: unknown;
  }>;
  regex: string;
  category: string;
}

export interface BuildComponent {
  name: string;
  category: "buttons" | "modals" | "selects";
  regex: string;
  path: string;
}

export type CommandHandler = (
  interaction: CommandInteraction,
) => Promise<void>;
export type ComponentHandler = (
  interaction: MessageComponentInteraction | ModalSubmitInteraction,
  args?: Record<string, string>,
) => Promise<void>;
