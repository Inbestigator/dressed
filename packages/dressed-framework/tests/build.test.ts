import { expect, test } from "bun:test";
import build from "@dressed/framework/build";

test("Build bot", async () => {
  const result = await build({ build: { root: "tests/src" } });
  console.log(process.env.__PROCESSED_ENV);
  expect(result).toMatchSnapshot();
});
