export { createInstance } from "../core/instance.ts";
import type { Command as CommandType } from "../internal/types/config.ts";

/**
 * Configuration for a specific command.
 *
 * Specify the description and options here.
 */
export interface CommandConfig extends Omit<CommandType, "name" | "default"> {}

export type { BotConfig } from "../internal/types/config.ts";

export type {
  CommandInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "../internal/types/interaction.ts";

export * from "../core/server.ts";
