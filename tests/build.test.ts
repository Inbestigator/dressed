import { assertEquals } from "@std/assert";
import { build } from "@dressed/dressed/server";

const withoutInstance =
  `export const commandData = [{"name":"ping","import": ()=>import("./src/commands/ping.ts")}];
export const componentData = [{"name":"button_[arg]","category":"buttons","regex":"^button_(?<arg>.+)$","import": ()=>import("./src/components/buttons/button_[arg].ts")}];
export const config = {};`;

const withInstance =
  `import { createHandlers, createServer } from "@dressed/dressed/server";
import { env } from "node:process";

export const commandData = [{"name":"ping","import": ()=>import("./src/commands/ping.ts")}];
export const componentData = [{"name":"button_[arg]","category":"buttons","regex":"^button_(?<arg>.+)$","import": ()=>import("./src/components/buttons/button_[arg].ts")}];
export const config = {};

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
