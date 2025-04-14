/**
 * This module contains functions to build, start, and handle a server.
 * This is separated from the main module to have a clear separation between the core functionality and the server methods.
 *
 * @example
 * ```ts
 * import { build } from "@dressed/dressed/server";
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
export type { ServerConfig } from "./internal/types/config.ts";
export type {
  CommandHandler,
  ComponentHandler,
} from "./internal/types/config.ts";

// Core
export { build } from "./core/build.ts";
export { installCommands, setupCommands } from "./core/bot/commands.ts";
export { setupComponents } from "./core/bot/components.ts";

// Server
export { verifySignature } from "./internal/utils.ts";
export * from "./core/server.ts";
