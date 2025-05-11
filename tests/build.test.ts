import { assertEquals } from "@std/assert";
import { build } from "@dressed/dressed/server";

const withoutBoth =
  `export const commandData = [{"name":"ping","import": ()=>import("./tests/src/commands/ping.ts")}];
export const componentData = [{"name":"button_[arg]","category":"buttons","regex":"^button_(?<arg>.+)$","import": ()=>import("./tests/src/components/buttons/button_[arg].ts")}];
export const eventData = [{"name":"ApplicationAuthorized","category":"APPLICATION_AUTHORIZED","import": ()=>import("./tests/src/events/ApplicationAuthorized.ts")}];
export const config = {"root":"tests/src"};`;

const withInstance =
  `import { createServer, setupCommands, setupComponents, setupEvents } from "@dressed/dressed/server";

export const commandData = [{"name":"ping","import": ()=>import("./tests/src/commands/ping.ts")}];
export const componentData = [{"name":"button_[arg]","category":"buttons","regex":"^button_(?<arg>.+)$","import": ()=>import("./tests/src/components/buttons/button_[arg].ts")}];
export const eventData = [{"name":"ApplicationAuthorized","category":"APPLICATION_AUTHORIZED","import": ()=>import("./tests/src/events/ApplicationAuthorized.ts")}];
export const config = {"root":"tests/src"};

createServer(setupCommands(commandData), setupComponents(componentData), setupEvents(eventData), config);`;

const withRegister = `import { installCommands } from "@dressed/dressed/server";

export const commandData = [{"name":"ping","import": ()=>import("./tests/src/commands/ping.ts")}];
export const componentData = [{"name":"button_[arg]","category":"buttons","regex":"^button_(?<arg>.+)$","import": ()=>import("./tests/src/components/buttons/button_[arg].ts")}];
export const eventData = [{"name":"ApplicationAuthorized","category":"APPLICATION_AUTHORIZED","import": ()=>import("./tests/src/events/ApplicationAuthorized.ts")}];
export const config = {"root":"tests/src"};

installCommands(commandData);`;

const withBoth =
  `import { createServer, installCommands, setupCommands, setupComponents, setupEvents } from "@dressed/dressed/server";

export const commandData = [{"name":"ping","import": ()=>import("./tests/src/commands/ping.ts")}];
export const componentData = [{"name":"button_[arg]","category":"buttons","regex":"^button_(?<arg>.+)$","import": ()=>import("./tests/src/components/buttons/button_[arg].ts")}];
export const eventData = [{"name":"ApplicationAuthorized","category":"APPLICATION_AUTHORIZED","import": ()=>import("./tests/src/events/ApplicationAuthorized.ts")}];
export const config = {"root":"tests/src"};

installCommands(commandData);

createServer(setupCommands(commandData), setupComponents(componentData), setupEvents(eventData), config);`;

Deno.test("Build bot without instance or register", async () => {
  const result = await build(false, false, { root: "tests/src" });
  assertEquals(result, withoutBoth);
});

Deno.test("Build bot with instance", async () => {
  const result = await build(true, false, { root: "tests/src" });
  assertEquals(result, withInstance);
});

Deno.test("Build bot with register", async () => {
  const result = await build(false, true, { root: "tests/src" });
  assertEquals(result, withRegister);
});

Deno.test("Build bot with instance and register", async () => {
  const result = await build(true, true, { root: "tests/src" });
  assertEquals(result, withBoth);
});
