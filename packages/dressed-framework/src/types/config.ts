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
     * Glob patterns for handler files to include
     * @default ["**\/*.{js,ts,mjs}"]
     * @example ["**\/*.{ts,tsx}", "!**\/*.test.ts"]
     * // Exclude test files
     */
    include?: string[];
  };
}
