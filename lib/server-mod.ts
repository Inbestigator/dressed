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
 *   const nodeServer = outputContent
 *     .replace(
 *       /server";\n/,
 *       '$&import { createServer } from "./server.ts";\n',
 *     )
 *     .replace(
 *       /console.warn\(.+\)/,
 *       "createServer(runCommand, runComponent, config)",
 *     );
 *   writeFileSync("./bot.gen.ts", new TextEncoder().encode(nodeServer));
 *   console.log("✔ Wrote to bot.gen.ts");
 * }
 *
 * genBot();
 * ```
 * @module
 */

// Types
export type {
  CommandHandler,
  ComponentHandler,
} from "./internal/types/config.ts";

// Core
export * from "./core/handlers.ts";
export { build } from "./core/build.ts";

// Server
export { verifySignature } from "./internal/utils.ts";
export * from "./core/server.ts";
