import { env } from "node:process";
import type { ServerConfig } from "../server/index.ts";
import { loadEnvConfig } from "./dotenv.ts";

interface BotEnvs {
  DISCORD_APP_ID: string;
  DISCORD_PUBLIC_KEY: string;
  DISCORD_TOKEN: string;
}

loadEnvConfig();

// @ts-expect-error Compatability with 1.10.0
// TODO Remove globalThis.DRESSED_CONFIG before next major version
export const serverConfig: ServerConfig = globalThis.DRESSED_CONFIG ?? {};

export const botEnv: BotEnvs = new Proxy({} as BotEnvs, {
  get(_, key: keyof BotEnvs) {
    const value = serverConfig.requests?.env?.[key] ?? env[key];
    if (!value) throw new Error(`Missing ${key}: please set it in your environment variables.`);
    return value;
  },
});
