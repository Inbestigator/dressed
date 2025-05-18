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
  expect(() => interaction.getOption("option2", true)).toThrowError(
    new Error(`Required option "option2" not found`),
  );
  const option = interaction.getOption("option3");
  expect(option).toBeNull();
});
