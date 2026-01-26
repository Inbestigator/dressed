import { env } from "node:process";
import type { DressedConfig } from "../types/config.ts";
import { loadEnvConfig } from "./dotenv.ts";

interface BotEnvs {
  DISCORD_APP_ID: string;
  DISCORD_PUBLIC_KEY: string;
  DISCORD_TOKEN: string;
}

loadEnvConfig();

/** The global configuration for various Dressed services. */
export const config: DressedConfig = {};

export const botEnv: BotEnvs = new Proxy({} as BotEnvs, {
  get(_, key: keyof BotEnvs) {
    const value = config.requests?.env?.[key] ?? env[key];
    if (!value) throw new Error(`Missing ${key}: please set it in your environment variables.`);
    return value;
  },
});
