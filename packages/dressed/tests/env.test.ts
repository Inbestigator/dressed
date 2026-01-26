import { expect, test } from "bun:test";
import { env } from "node:process";
import { botEnv, config } from "dressed/utils";

test("Environment variables", () => {
  expect(() => botEnv.DISCORD_APP_ID).toThrow();

  env.DISCORD_APP_ID = "app_id";

  expect(botEnv.DISCORD_APP_ID).toMatchSnapshot();

  config.requests = { env: { DISCORD_APP_ID: "overriden_app_id" } };

  expect(botEnv.DISCORD_APP_ID).toMatchSnapshot();
});
