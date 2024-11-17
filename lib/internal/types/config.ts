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
  /** Are you using Deno? Defaults to `true` */
  deno?: boolean;
}

export interface Command {
  name: string;
  /** The description for the command */
  description?: string;
  /** The options for the command
   *
   * @see https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure
   */
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
