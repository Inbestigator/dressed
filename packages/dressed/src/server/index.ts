/**
 * Special utilities for making your own server
 *
 * @module
 */

// Types
export type {
  BaseData,
  CommandData,
  ComponentData,
  EventData,
  ServerConfig,
} from "../types/config.ts";
export type {
  CommandHandler,
  ComponentHandler,
  EventHandler,
} from "../types/handlers.ts";
export type { RawFile } from "../types/file.ts";

// Core
export { createInteraction } from "./extenders/interaction.ts";
export { installCommands, setupCommands } from "./handlers/commands.ts";
export { setupComponents } from "./handlers/components.ts";
export { setupEvents } from "./handlers/events.ts";

// Server
export { verifySignature } from "./signature.ts";
export * from "./server.ts";
