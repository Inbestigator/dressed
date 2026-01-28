import { expect, test } from "bun:test";
import type { APIApplicationCommandInteraction } from "discord-api-types/v10";
import { createInteraction } from "dressed/server";

const command = {
  type: 2,
  data: { type: 1, options: [{ name: "option1", type: 5, value: true }] },
} as APIApplicationCommandInteraction;
const interaction = createInteraction(command);

test("Check for existing option", () => expect(interaction.options.option1).toBeTrue());
test("Check for non existing option", () => expect(interaction.options.option2).toBeUndefined());
