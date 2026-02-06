import { describe, expect, test } from "bun:test";
import {
  type APIInteraction,
  type APIInteractionDataResolved,
  type APIMessage,
  type APIMessageApplicationCommandInteractionDataResolved,
  type APIModalSubmitInteraction,
  type APIUser,
  ApplicationCommandType,
  ComponentType,
  InteractionType,
} from "discord-api-types/v10";
import { createInteraction } from "./interaction.ts";

const resolved: APIInteractionDataResolved | APIMessageApplicationCommandInteractionDataResolved = {
  users: { u1: { id: "u1" } as APIUser },
  messages: { u1: { id: "m1" } as APIMessage },
};

const interactionData: Record<string, (object | undefined)[]> = {
  ApplicationCommand: [
    { type: ApplicationCommandType.ChatInput },
    { type: ApplicationCommandType.User, target_id: "u1" },
    { type: ApplicationCommandType.Message, target_id: "u1" },
  ],
  MessageComponent: [{ type: InteractionType.MessageComponent }],
  ApplicationCommandAutocomplete: [{ type: ApplicationCommandType.ChatInput }],
  ModalSubmit: [
    {
      type: InteractionType.ModalSubmit,
      components: [
        {
          type: ComponentType.ActionRow,
          components: [{ type: ComponentType.TextInput, custom_id: "textInput", value: "test" }],
        },
        {
          type: ComponentType.Label,
          component: { type: ComponentType.UserSelect, custom_id: "userSelect", values: ["u1"] },
        },
      ],
    },
  ],
  Ping: [undefined],
};

describe("createInteraction", () => {
  for (const [type, variants] of Object.entries(interactionData) as [keyof typeof InteractionType, object[]][]) {
    for (let i = 0; i < variants.length; ++i) {
      test(`${type} ${i}`, () => {
        expect(
          createInteraction({
            type: InteractionType[type],
            data: { ...variants[i], resolved },
          } as unknown as APIInteraction),
        ).toMatchSnapshot();
      });
    }
  }
});

test("getField", () => {
  expect(
    createInteraction({
      type: InteractionType.ModalSubmit,
      data: { ...interactionData.ModalSubmit[0], resolved },
    } as APIModalSubmitInteraction)
      .getField("textInput", true)
      .textInput(),
  ).toBe("test");
});
