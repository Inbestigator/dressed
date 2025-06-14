import type { APIWebhookEventBody } from "discord-api-types/v10";
import type {
  CommandMiddleware,
  ComponentMiddleware,
  EventMiddleware,
} from "./config.ts";
import type { AnyEvent } from "./event.ts";
import type {
  CommandInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "./interaction.ts";

export type CommandHandler = (interaction: CommandInteraction) => Promise<void>;
export type ComponentHandler = (
  interaction: MessageComponentInteraction | ModalSubmitInteraction,
) => Promise<void>;
export type EventHandler = (event: AnyEvent) => Promise<void>;

export type CommandRunner = (
  interaction: CommandInteraction,
  middleware?: CommandMiddleware,
) => Promise<void>;
export type ComponentRunner = (
  interaction: MessageComponentInteraction | ModalSubmitInteraction,
  middleware?: ComponentMiddleware,
) => Promise<void>;
export type EventRunner = (
  event: APIWebhookEventBody,
  middleware?: EventMiddleware,
) => Promise<void>;
