import { assertEquals } from "@std/assert/equals";
import { botEnv } from "../lib/internal/utils.ts";

Deno.test("Environment variables", () => {
  try {
    botEnv.DISCORD_APP_ID;
    botEnv.DISCORD_PUBLIC_KEY;
    botEnv.DISCORD_TOKEN;
    throw new Error("Envs should be missing");
  } catch (e) {
    if (e instanceof Error && e.message === "Envs should be missing") {
      throw e;
    }
  }
  Deno.env.set("DISCORD_APP_ID", "app_id");
  Deno.env.set("DISCORD_PUBLIC_KEY", "public_key");
  Deno.env.set("DISCORD_TOKEN", "bot_token");
  assertEquals({
    DISCORD_APP_ID: botEnv.DISCORD_APP_ID,
    DISCORD_PUBLIC_KEY: botEnv.DISCORD_PUBLIC_KEY,
    DISCORD_TOKEN: botEnv.DISCORD_TOKEN,
  }, {
    DISCORD_APP_ID: "app_id",
    DISCORD_PUBLIC_KEY: "public_key",
    DISCORD_TOKEN: "bot_token",
  });
});
