import { test, expect } from "bun:test";
import type { APIApplicationCommandInteraction } from "discord-api-types/v10";
import createInteraction from "../src/server/interaction";

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

test("Check for existing option", () => {
  expect(interaction.getOption("option1", true).boolean()).toBeTrue();
  expect(interaction.getOption("option1")?.boolean()).toBeTrue();
});

test("Check for non existing option", () => {
  let fail = false;
  try {
    interaction.getOption("option2", true);
    fail = true;
  } catch {
    if (fail) {
      throw new Error("Should have thrown");
    }
  }
  expect(interaction.getOption("option2")?.boolean()).toBeUndefined();
});
