import { expect, test } from "bun:test";
import { build, ServerConfig } from "../src/server";

const config: ServerConfig = { root: "tests/src" };

test("Build bot", async () => {
  const result = await build(config);
  expect(result).toMatchSnapshot();
});
