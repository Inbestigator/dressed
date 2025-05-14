import { expect, test } from "bun:test";
import { build, ServerConfig } from "../src/server";

const withoutBoth = `export const commands = [{"name":"ping","import": ()=>import("./tests/src/commands/ping.ts")}];
export const components = [{"name":"button_[arg]","category":"buttons","regex":"^button_(?<arg>.+)$","import": ()=>import("./tests/src/components/buttons/button_[arg].ts")}];
export const events = [{"name":"ApplicationAuthorized","type":"APPLICATION_AUTHORIZED","import": ()=>import("./tests/src/events/ApplicationAuthorized.ts")}];
export const config = {"root":"tests/src"};`;

const withInstance = `import { createServer, setupCommands, setupComponents, setupEvents } from "dressed/server";

export const commands = [{"name":"ping","import": ()=>import("./tests/src/commands/ping.ts")}];
export const components = [{"name":"button_[arg]","category":"buttons","regex":"^button_(?<arg>.+)$","import": ()=>import("./tests/src/components/buttons/button_[arg].ts")}];
export const events = [{"name":"ApplicationAuthorized","type":"APPLICATION_AUTHORIZED","import": ()=>import("./tests/src/events/ApplicationAuthorized.ts")}];
export const config = {"root":"tests/src"};

createServer(setupCommands(commands), setupComponents(components), setupEvents(events), config);`;

const withRegister = `import { installCommands } from "dressed/server";

export const commands = [{"name":"ping","import": ()=>import("./tests/src/commands/ping.ts")}];
export const components = [{"name":"button_[arg]","category":"buttons","regex":"^button_(?<arg>.+)$","import": ()=>import("./tests/src/components/buttons/button_[arg].ts")}];
export const events = [{"name":"ApplicationAuthorized","type":"APPLICATION_AUTHORIZED","import": ()=>import("./tests/src/events/ApplicationAuthorized.ts")}];
export const config = {"root":"tests/src"};

installCommands(commands);`;

const withBoth = `import { createServer, installCommands, setupCommands, setupComponents, setupEvents } from "dressed/server";

export const commands = [{"name":"ping","import": ()=>import("./tests/src/commands/ping.ts")}];
export const components = [{"name":"button_[arg]","category":"buttons","regex":"^button_(?<arg>.+)$","import": ()=>import("./tests/src/components/buttons/button_[arg].ts")}];
export const events = [{"name":"ApplicationAuthorized","type":"APPLICATION_AUTHORIZED","import": ()=>import("./tests/src/events/ApplicationAuthorized.ts")}];
export const config = {"root":"tests/src"};

installCommands(commands);

createServer(setupCommands(commands), setupComponents(components), setupEvents(events), config);`;

const config: ServerConfig = { root: "tests/src" };

test("Build bot without instance or register", async () => {
  const result = await build(false, false, config);
  expect(result).toBe(withoutBoth);
});

test("Build bot with instance", async () => {
  const result = await build(true, false, config);
  expect(result).toBe(withInstance);
});

test("Build bot with register", async () => {
  const result = await build(false, true, config);
  expect(result).toBe(withRegister);
});

test("Build bot with instance and register", async () => {
  const result = await build(true, true, config);
  expect(result).toBe(withBoth);
});
