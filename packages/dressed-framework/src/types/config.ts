import type { DressedConfig as CoreDressedConfig } from "dressed/utils";

/** Configuration for various Dressed services. */
export interface DressedConfig extends CoreDressedConfig {
  /** Build configuration */
  build?: {
    /**
     * Look for component handler files within the root.
     * If true, `[root]/buttons/hello.ts` = `[root]/components/buttons/hello.ts)`
     * @default true
     */
    flatComponents?: boolean;
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
