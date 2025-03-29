import { assertEquals } from "@std/assert";
import { build } from "@dressed/dressed/server";

const withoutBoth =
  `export const commandData = [{"name":"ping","import": ()=>import("./src/commands/ping.ts")}];
export const componentData = [{"name":"button_[arg]","category":"buttons","regex":"^button_(?<arg>.+)$","import": ()=>import("./src/components/buttons/button_[arg].ts")}];
export const config = {};`;

const withInstance =
  `import { createHandlers, createServer } from "@dressed/dressed/server";

export const commandData = [{"name":"ping","import": ()=>import("./src/commands/ping.ts")}];
export const componentData = [{"name":"button_[arg]","category":"buttons","regex":"^button_(?<arg>.+)$","import": ()=>import("./src/components/buttons/button_[arg].ts")}];
export const config = {};

const { runCommand, runComponent } = createHandlers(commandData, componentData);
createServer(runCommand, runComponent, config);`;

const withRegister = `import { installCommands } from "@dressed/dressed/server";

export const commandData = [{"name":"ping","import": ()=>import("./src/commands/ping.ts")}];
export const componentData = [{"name":"button_[arg]","category":"buttons","regex":"^button_(?<arg>.+)$","import": ()=>import("./src/components/buttons/button_[arg].ts")}];
export const config = {};

installCommands(commandData);`;

const withBoth =
  `import { createHandlers, createServer, installCommands } from "@dressed/dressed/server";

export const commandData = [{"name":"ping","import": ()=>import("./src/commands/ping.ts")}];
export const componentData = [{"name":"button_[arg]","category":"buttons","regex":"^button_(?<arg>.+)$","import": ()=>import("./src/components/buttons/button_[arg].ts")}];
export const config = {};

installCommands(commandData);

const { runCommand, runComponent } = createHandlers(commandData, componentData);
createServer(runCommand, runComponent, config);`;

Deno.test("Build bot without instance or register", async () => {
  if (!Deno.cwd().endsWith("tests")) {
    throw new Error("Must be in tests directory");
  }
  const result = await build();
  assertEquals(result, withoutBoth);
});

Deno.test("Build bot with instance", async () => {
  if (!Deno.cwd().endsWith("tests")) {
    throw new Error("Must be in tests directory");
  }
  const result = await build(true, false);
  assertEquals(result, withInstance);
});

Deno.test("Build bot with register", async () => {
  if (!Deno.cwd().endsWith("tests")) {
    throw new Error("Must be in tests directory");
  }
  const result = await build(false, true);
  assertEquals(result, withRegister);
});

Deno.test("Build bot with instance and register", async () => {
  if (!Deno.cwd().endsWith("tests")) {
    throw new Error("Must be in tests directory");
  }
  const result = await build(true, true);
  assertEquals(result, withBoth);
});
