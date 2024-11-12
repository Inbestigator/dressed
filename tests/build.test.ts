import { assertEquals } from "@std/assert";
import { build } from "../lib/exports/mod.ts";

const withoutInstance = `import "./src/commands/ping.ts";
import "./bot.config.ts";

const commandFiles = [{"path":"src\\\\commands\\\\ping.ts","name":"ping.ts","isFile":true,"isDirectory":false,"isSymlink":false}];

const config = {"clientId":""};`;

const withInstance =
  `import { createInstance } from "@inbestigator/discord-http";
import "./src/commands/ping.ts";
import "./bot.config.ts";
import { env } from "node:process";

const commandFiles = [{"path":"src\\\\commands\\\\ping.ts","name":"ping.ts","isFile":true,"isDirectory":false,"isSymlink":false}];

const config = {"clientId":""};

env.REGISTER_COMMANDS = "true";

await createInstance(config, commandFiles, []);`;

Deno.test("Build bot without instance", async () => {
  if (!Deno.cwd().endsWith("tests")) {
    throw new Error("Must be in tests directory");
  }
  const result = await build();
  assertEquals(result, withoutInstance);
});

Deno.test("Build bot with instance", async () => {
  if (!Deno.cwd().endsWith("tests")) {
    throw new Error("Must be in tests directory");
  }
  const result = await build(true);
  assertEquals(result, withInstance);
});
