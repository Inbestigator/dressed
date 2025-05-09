import { assertEquals } from "@std/assert/equals";
import { botEnv } from "../lib/internal/utils.ts";

Deno.test("Environment variables", () => {
  let fail = false;
  try {
    botEnv();
    fail = true;
  } catch {
    if (fail) {
      throw new Error("Envs should be missing");
    }
  }
  Deno.env.set("DISCORD_APP_ID", "app_id");
  Deno.env.set("DISCORD_PUBLIC_KEY", "public_key");
  Deno.env.set("DISCORD_TOKEN", "bot_token");
  assertEquals(botEnv(), {
    DISCORD_APP_ID: "app_id",
    DISCORD_PUBLIC_KEY: "public_key",
    DISCORD_TOKEN: "bot_token",
  });
});
