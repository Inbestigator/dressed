import { assertEquals } from "@std/assert";
import type { APIApplicationCommandInteraction } from "discord-api-types/v10";
import createInteraction from "../lib/internal/interaction.ts";

const command = {
  type: 2,
  data: {
    options: [
      {
        name: "option1",
        type: 5,
        value: true,
      },
    ],
  },
} as APIApplicationCommandInteraction;
const interaction = createInteraction(command);

Deno.test("Check for existing option", () => {
  assertEquals(
    interaction.getOption("option1", true).boolean(),
    true,
  );
  assertEquals(
    interaction.getOption("option1")?.boolean(),
    true,
  );
});

Deno.test("Check for non existing option", () => {
  try {
    interaction.getOption("option2", true);
    throw new Error("Should have thrown");
  } catch {
    // pass
  }
  assertEquals(
    interaction.getOption("option2")?.boolean(),
    undefined,
  );
});
