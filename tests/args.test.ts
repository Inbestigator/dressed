import { assertEquals } from "@std/assert";
import { handleArgs } from "../lib/core/bot/components.ts";

Deno.test("Handle dynamic component args", () => {
  assertEquals(handleArgs("test_[a]_[b]_c"), {
    argNames: ["a", "b"],
    regex: new RegExp(`^test_([a-zA-Z0-9_-]+?)_([a-zA-Z0-9_-]+?)_c$`),
  });
});

Deno.test("Handle static component id", () => {
  assertEquals(handleArgs("ping"), {
    argNames: [],
    regex: new RegExp(`^ping$`),
  });
});
