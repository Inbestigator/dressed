import { expect, test } from "bun:test";
import { env } from "node:process";
import { botEnv } from "dressed/server";

test("Environment variables", () => {
  try {
    void botEnv.DISCORD_APP_ID;
    void botEnv.DISCORD_PUBLIC_KEY;
    void botEnv.DISCORD_TOKEN;
    throw new Error("Envs should be missing");
  } catch (e) {
    if (e instanceof Error && e.message === "Envs should be missing") {
      throw e;
    }
  }
  env.DISCORD_APP_ID = "app_id";
  env.DISCORD_PUBLIC_KEY = "public_key";
  env.DISCORD_TOKEN = "bot_token";
  expect({
    DISCORD_APP_ID: botEnv.DISCORD_APP_ID,
    DISCORD_PUBLIC_KEY: botEnv.DISCORD_PUBLIC_KEY,
    DISCORD_TOKEN: botEnv.DISCORD_TOKEN,
  }).toEqual({
    DISCORD_APP_ID: "app_id",
    DISCORD_PUBLIC_KEY: "public_key",
    DISCORD_TOKEN: "bot_token",
  });
});
