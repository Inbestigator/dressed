import { assertEquals } from "@std/assert";
import { build } from "@dressed/dressed/server";

const withoutInstance =
  `const commandData = [{"name":"ping","import": ()=>import("./src/commands/ping.ts")}];
const componentData = [{"name":"button","category":"buttons","import": ()=>import("./src/components/buttons/button.ts")}];
const config = {};`;

const withInstance =
  `import { createHandlers, createServer } from "@dressed/dressed/server";
import { env } from "node:process";

const commandData = [{"name":"ping","import": ()=>import("./src/commands/ping.ts")}];
const componentData = [{"name":"button","category":"buttons","import": ()=>import("./src/components/buttons/button.ts")}];
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
