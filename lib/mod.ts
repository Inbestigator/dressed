import setupCommands from "./core/bot/commands.ts";
import setupComponents from "./core/bot/components.ts";

// Types
export type { BotConfig, CommandConfig } from "./internal/types/config.ts";
export type {
  CommandInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "./internal/types/interaction.ts";

// Core
export * from "./core/handlers.ts";
export * from "./core/server.ts";
export { verifySignature } from "./internal/utils.ts";
export { setupCommands, setupComponents };
export { build } from "./core/build.ts";

// Components
export * from "./core/components/actionrow.ts";
export * from "./core/components/button.ts";
export * from "./core/components/selectmenu.ts";
export * from "./core/components/textinput.ts";
export * from "./core/bot/options.ts";

// API interactions
export * from "./core/bot/application.ts";
export * from "./core/bot/audit-log.ts";
export * from "./core/bot/automod.ts";
export * from "./core/bot/channels.ts";
export * from "./core/bot/guilds.ts";
export * from "./core/bot/messages.ts";
export * from "./core/bot/role-connections.ts";
export * from "./core/bot/threads.ts";
export * from "./core/bot/users.ts";
export * from "./core/bot/voice.ts";
