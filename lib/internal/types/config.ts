import type {
  CommandInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "./interaction.ts";
import type {
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord-api-types/v10";

/**
 * The configuration for the bot.
 */
export interface BotConfig {
  /** The endpoint that Discord will use */
  endpoint?: string;
  /** The port to listen on, defaults to `8000` */
  port?: number;
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
  category: string;
}

export interface BuildComponent {
  name: string;
  category: "buttons" | "modals" | "selects";
  path: string;
}

export type CommandHandler = (
  interaction: CommandInteraction,
) => Promise<unknown> | unknown;
export type ComponentHandler = (
  interaction: MessageComponentInteraction | ModalSubmitInteraction,
  args?: Record<string, string>,
) => Promise<unknown> | unknown;
