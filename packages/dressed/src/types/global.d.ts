import type { ServerConfig } from "./config.ts";

declare global {
  var DRESSED_CONFIG: ServerConfig | undefined;
}
