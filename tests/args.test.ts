import { assertEquals } from "@std/assert";
import { parseArgs } from "../lib/core/bot/components.ts";

Deno.test("Handle dynamic component args", () => {
  assertEquals(
    parseArgs("test_[a]_[b]_c"),
    new RegExp(`^test_(?<a>.+)_(?<b>.+)_c$`),
  );
});

Deno.test("Handle static component id", () => {
  assertEquals(parseArgs("ping"), new RegExp(`ping`));
});
