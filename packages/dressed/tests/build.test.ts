import { expect, test } from "bun:test";
import build from "dressed/build";

test("Build bot", async () => {
  const result = await build({ build: { root: "tests/src" } });
  expect(result).toMatchSnapshot();
});
