import { env } from "node:process";
import { loadEnvConfig } from "./dotenv.ts";

interface BotEnvs {
  DISCORD_APP_ID: string;
  DISCORD_PUBLIC_KEY: string;
  DISCORD_TOKEN: string;
}

loadEnvConfig();
globalThis.DRESSED_CONFIG ??= {};

export const botEnv: BotEnvs = new Proxy({} as BotEnvs, {
  get(_, key: keyof BotEnvs) {
    const value = globalThis.DRESSED_CONFIG.requests?.env?.[key] ?? env[key];
    if (!value) {
      throw new Error(`Missing ${key}: please set it in your environment variables.`);
    }
    return value;
  },
});
