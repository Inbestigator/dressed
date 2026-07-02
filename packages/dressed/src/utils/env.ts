import type { DressedConfig } from "../types/config.ts";

interface BotEnvs {
  DISCORD_APP_ID: string;
  DISCORD_PUBLIC_KEY: string;
  DISCORD_TOKEN: string;
}

/** The global configuration for various Dressed services. */
export const config: DressedConfig = {};

/** The loaded env vars pertaining to bots, overriden by {@link config.requests.env}. */
export const botEnv = Object.seal(
  new Proxy(
    {
      DISCORD_APP_ID: process?.env.DISCORD_APP_ID,
      DISCORD_PUBLIC_KEY: process?.env.DISCORD_PUBLIC_KEY,
      DISCORD_TOKEN: process?.env.DISCORD_TOKEN,
    } as BotEnvs,
    {
      get(target, key: keyof BotEnvs) {
        if (!(key in target)) throw new TypeError(`${key} is not a valid botEnv key`);
        const value = config.requests?.env?.[key] || target[key] || process?.env[key];
        if (!value) {
          throw new Error(`Missing ${key}: try setting it in your environment variables or overwriting botEnv.${key}`);
        }
        return value;
      },
      set: (target, key: keyof BotEnvs, value) => (target[key] = value),
    },
  ),
);
