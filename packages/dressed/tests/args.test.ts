import { expect, test } from "bun:test";
import { parseArgs } from "../src/bot/components.ts";

test("Handle dynamic component args", () => {
  expect(parseArgs("test_[a]_[b]_c")).toEqual(
    new RegExp("^test_(?<a>.+)_(?<b>.+)_c$"),
  );
});

test("Handle static component id", () => {
  expect(parseArgs("ping")).toEqual(new RegExp("ping"));
});
