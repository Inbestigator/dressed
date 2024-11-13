import type { APIApplicationCommandOption } from "discord-api-types/v10";
import type {
  CommandInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "./interaction.ts";

/**
 * The configuration for the bot.
 */
export interface BotConfig {
  /** The ID for the bot */
  clientId: string;
  /** The bot's secret */
  clientSecret?: string;
  /** The endpoint that Discord will use */
  endpoint?: string;
}

export interface Command {
  name: string;
  description?: string;
  options?: APIApplicationCommandOption[];
  default: (interaction: CommandInteraction) => unknown;
}

export interface Component {
  name: string;
  category: "buttons" | "modals" | "selects";
  default: (
    interaction: MessageComponentInteraction | ModalSubmitInteraction,
    args?: Record<string, string>,
  ) => unknown;
}
