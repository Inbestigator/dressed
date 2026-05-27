import type { DressedConfig } from "../types/config.ts";

const env = globalThis.process?.env ?? {};

interface BotEnvs {
  DISCORD_APP_ID: string;
  DISCORD_PUBLIC_KEY: string;
  DISCORD_TOKEN: string;
}

/** The global configuration for various Dressed services. */
export const config: DressedConfig = {};

/** The loaded env vars pertaining to bots, overriden by {@link config}. */
export const botEnv: BotEnvs = new Proxy({} as BotEnvs, {
  get(_, key: keyof BotEnvs) {
    const value = config.requests?.env?.[key] ?? env[key];
    if (!value) throw new Error(`Missing ${key}: please set it in your environment variables.`);
    return value;
  },
});
