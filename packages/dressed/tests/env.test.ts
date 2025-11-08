import { expect, test } from "bun:test";
import { env } from "node:process";
import { botEnv, serverConfig } from "dressed/utils";

test("Environment variables", () => {
  expect(() => botEnv.DISCORD_APP_ID).toThrow();

  env.DISCORD_APP_ID = "app_id";

  expect(botEnv.DISCORD_APP_ID).toMatchSnapshot();

  serverConfig.requests = { env: { DISCORD_APP_ID: "overriden_app_id" } };

  expect(botEnv.DISCORD_APP_ID).toMatchSnapshot();
});
