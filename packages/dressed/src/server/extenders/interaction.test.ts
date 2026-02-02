import { expect, test } from "bun:test";
import { type APIApplicationCommandInteraction, ApplicationCommandOptionType } from "discord-api-types/v10";
import { createInteraction } from "./interaction.ts";

const command = {
  type: 2,
  data: {
    type: 1,
    options: [
      { name: "option1", type: ApplicationCommandOptionType.Boolean, value: true },
      {
        name: "subcommand1",
        type: ApplicationCommandOptionType.Subcommand,
        options: [{ name: "option2", type: ApplicationCommandOptionType.String, value: "test" }],
      },
    ],
  },
} as APIApplicationCommandInteraction;
const interaction = createInteraction(command);

test("Check for existing option", () => expect(interaction.options.option1).toBeTrue());
test("Check for subcommand", () => expect(interaction.options.subcommand1).toMatchSnapshot());
test("Check for non existing option", () => expect(interaction.options.option3).toBeUndefined());
