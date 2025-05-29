import { expect, test, mock } from "bun:test";
import type { ServerConfig } from "dressed/server";
import build from "dressed/build";
import { join } from "node:path";

const config: ServerConfig = { root: "tests/src" };
mock.module("node:url", () => ({
  pathToFileURL: (path: string) => ({ href: join("../../../..", path) }),
}));

test("Build bot", async () => {
  crypto.randomUUID = () =>
    "XXXXXX-XXXXXX-XXXXXX-XXXXXX-XXXXXX" as ReturnType<
      typeof crypto.randomUUID
    >;
  const result = await build(config);
  expect(result).toMatchSnapshot();
});
