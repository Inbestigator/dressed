import "dotenv/config";
import { env } from "node:process";

interface BotEnvs {
  DISCORD_APP_ID: string;
  DISCORD_PUBLIC_KEY: string;
  DISCORD_TOKEN: string;
}

export const botEnv = new Proxy({} as BotEnvs, {
  get(_, key: string) {
    const value = env[key];
    if (!value) {
      throw new Error(
        `Missing ${key}: please set it in your environment variables.`,
      );
    }
    return value;
  },
});
