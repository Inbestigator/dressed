import { expect, test } from "bun:test";
import build from "@dressed/framework/build";

test("Build bot", () => {
  expect(build({ build: { root: "tests/src" } })).resolves.toMatchSnapshot();
});
