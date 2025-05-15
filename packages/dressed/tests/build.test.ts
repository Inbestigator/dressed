import { expect, test } from "bun:test";
import { build, ServerConfig } from "../src/server";

const config: ServerConfig = { root: "tests/src" };

test("Build bot", async () => {
  const result = await build(config);
  expect(result).toEqual({
    commands: [{ name: "ping", path: "tests/src/commands/ping.ts" }],
    components: [
      {
        name: "button_[arg]",
        category: "buttons",
        regex: "^button_(?<arg>.+)$",
        path: "tests/src/components/buttons/button_[arg].ts",
      },
    ],
    events: [
      {
        name: "ApplicationAuthorized",
        type: "APPLICATION_AUTHORIZED",
        path: "tests/src/events/ApplicationAuthorized.ts",
      },
    ],
    config: { root: "tests/src" },
  });
});
