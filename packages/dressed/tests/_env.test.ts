import { expect, test } from "bun:test";
import { env } from "node:process";
import { botEnv } from "dressed/utils";

test("Environment variables", () => {
  expect(() => {
    void botEnv.DISCORD_APP_ID;
    void botEnv.DISCORD_PUBLIC_KEY;
    void botEnv.DISCORD_TOKEN;
  }).toThrow();

  env.DISCORD_APP_ID = "app_id";
  env.DISCORD_PUBLIC_KEY = "public_key";
  env.DISCORD_TOKEN = "bot_token";

  expect({
    DISCORD_APP_ID: botEnv.DISCORD_APP_ID,
    DISCORD_PUBLIC_KEY: botEnv.DISCORD_PUBLIC_KEY,
    DISCORD_TOKEN: botEnv.DISCORD_TOKEN,
  }).toMatchSnapshot();
});
