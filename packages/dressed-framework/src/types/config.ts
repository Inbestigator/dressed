import type { ServerConfig as CoreServerConfig } from "dressed/server";

/**
 * The configuration for the server.
 */
export interface ServerConfig extends CoreServerConfig {
  /** Build configuration */
  build?: {
    /**
     * Source root for the bot
     * @default "src"
     */
    root?: string;
    /**
     * File extensions to include when bundling handlers
     * @default ["js", "ts", "mjs"]
     */
    extensions?: string[];
  };
}
