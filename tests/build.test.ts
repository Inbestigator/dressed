import { assertEquals } from "@std/assert";
import { build } from "../lib/exports/mod.ts";

const withoutInstance = `import "./src/commands/ping.ts";
import "./bot.config.ts";

const commandFiles = [{"name":"ping","path":"src/commands/ping.ts"}];

const config = {"clientId":""};`;

const withInstance =
  `import { createInstance } from "@inbestigator/discord-http";
import { env } from "node:process";
import "./src/commands/ping.ts";
import "./bot.config.ts";

const commandFiles = [{"name":"ping","path":"src/commands/ping.ts"}];

const config = {"clientId":""};

env.REGISTER_COMMANDS = "true";

createInstance(config, commandFiles, []);`;

Deno.test("Build bot without instance", async () => {
  if (!Deno.cwd().endsWith("tests")) {
    throw new Error("Must be in tests directory");
  }
  const result = await build();
  assertEquals(result, withoutInstance);
});

Deno.test("Build bot with instance and register", async () => {
  if (!Deno.cwd().endsWith("tests")) {
    throw new Error("Must be in tests directory");
  }
  const result = await build(true, true);
  assertEquals(result, withInstance);
});
