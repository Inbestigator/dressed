import { expect, test } from "bun:test";
import { env } from "node:process";
import { botEnv, config } from "./env.ts";

test("Environment variables", () => {
  expect(() => botEnv.DISCORD_APP_ID).toThrow();

  env.DISCORD_APP_ID = "app_id";

  expect(botEnv.DISCORD_APP_ID).toBe("app_id");

  config.requests = { env: { DISCORD_APP_ID: "overriden_app_id" } };

  expect(botEnv.DISCORD_APP_ID).toBe("overriden_app_id");
});
