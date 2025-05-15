/**
 * This module contains functions to build, start, and handle a server.
 * This is separated from the main module to have a clear separation between the core functionality and the server methods.
 *
 * @example
 * ```ts
 * import { build } from "dressed/server";
 * import { writeFileSync } from "node:fs";
 *
 * async function genBot() {
 *   const outputContent = await build(true, false);
 *   writeFileSync("./bot.gen.ts", new TextEncoder().encode(outputContent));
 *   console.log("✔ Wrote to bot.gen.ts");
 * }
 *
 * genBot();
 * ```
 * @module
 */

// Types
export type {
  CommandData,
  ComponentData,
  EventData,
  ServerConfig,
} from "../types/config.ts";
export type { CommandHandler, ComponentHandler } from "../types/config.ts";

// Core
export { build } from "../build.ts";
export { installCommands, setupCommands } from "../bot/commands.ts";
export { setupComponents } from "../bot/components.ts";
export { setupEvents } from "../bot/events.ts";

// Server
export { verifySignature } from "./signature.ts";
export * from "../env.ts";
export * from "./server.ts";
