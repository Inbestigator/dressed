import type { DressedConfig as CoreDressedConfig } from "dressed/utils";

/** Configuration for various Dressed services. */
export interface DressedConfig extends CoreDressedConfig {
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
