/**
 * Serverless-friendly handler utilities.
 * Import from `dressed/handler` for edge runtimes (Cloudflare Workers, Vercel Edge, Deno Deploy).
 * This entry point avoids pulling in `node:http` and `dotenv`.
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
  CommandRunner,
  ComponentRunner,
  EventRunner,
} from "../types/handlers.ts";

// Handler functions (no node:http dependency)
export { handleInteraction, handleEvent, handleRequest } from "../server/handler.ts";
export { verifySignature } from "../server/signature.ts";
export { createInteraction } from "../server/extenders/interaction.ts";
export { setupCommands, registerCommands } from "../server/handlers/commands.ts";
export { setupComponents } from "../server/handlers/components.ts";
export { setupEvents } from "../server/handlers/events.ts";