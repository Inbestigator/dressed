import { assertEquals } from "@std/assert";
import { build } from "../lib/exports/mod.ts";

const withoutInstance = `import "./src/commands/ping.ts";
import "./src/components/buttons/button.ts";

const commandData = [{"name":"ping","path":"src/commands/ping.ts"}];
const componentData = [{"name":"button","category":"buttons","path":"src/components/buttons/button.ts"}];
const config = {};`;

const withInstance =
  `import { createHandlers, createServer } from "@inbestigator/discord-http";
import { env } from "node:process";
import "./src/commands/ping.ts";
import "./src/components/buttons/button.ts";

const commandData = [{"name":"ping","path":"src/commands/ping.ts"}];
const componentData = [{"name":"button","category":"buttons","path":"src/components/buttons/button.ts"}];
const config = {};

env.REGISTER_COMMANDS = "true";

async function startServer() {
  const { runCommand, runComponent } = await createHandlers(commandData, componentData);
  createServer(runCommand, runComponent, config);
}
  
startServer();`;

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
