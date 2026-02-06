import { beforeAll, describe, expect, mock, test } from "bun:test";
import type { APIInteraction } from "discord-api-types/v10";
import type { BaseInteractionMethods } from "../../types/interaction.ts";
import { baseInteractionMethods } from "./responses.ts";

const functions: Record<string, unknown[][]> = {
  reply: [["test"], [{ ephemeral: true }]],
  deferReply: [[{ ephemeral: true }]],
  update: [["test"]],
  deferUpdate: [[undefined]],
  editReply: [["test"]],
  followUp: [["followUp"], [{ ephemeral: true }]],
  showModal: [[{ custom_id: "modal", title: "test", components: [] }, undefined]],
  sendChoices: [[[], undefined]],
};

beforeAll(() => {
  globalThis.fetch = mock(async () => new Response(JSON.stringify({ ok: true }))) as unknown as typeof globalThis.fetch;
});

describe("methods", async () => {
  const methods = baseInteractionMethods({} as APIInteraction);
  for (const [name, variants] of Object.entries(functions) as [keyof BaseInteractionMethods, unknown[][]][]) {
    for (let i = 0; i < variants.length; ++i) {
      test(`${name} ${i}`, () => {
        expect((methods[name] as CallableFunction)(...variants[i], { authorization: "test" })).resolves;
        expect(methods.history.join()).toIncludeRepeated(name, i + 1);
      });
    }
  }
});

test("baseInteractionMethods", () => {
  expect(baseInteractionMethods({} as APIInteraction)).toMatchSnapshot();
});
