import { describe, expect, test } from "bun:test";
import {
  type APIAttachment,
  type APIInteractionDataResolved,
  type APIInteractionDataResolvedChannel,
  type APIRole,
  type APIUser,
  ComponentType,
  type ModalSubmitComponent,
} from "discord-api-types/v10";
import { type FieldValueGetters, getField } from "./fields.ts";

const fields: ModalSubmitComponent[] = [
  { custom_id: "string-select", type: ComponentType.StringSelect, values: ["a", "b"] },
  { custom_id: "text-input", type: ComponentType.TextInput, value: "test" },
  { custom_id: "user-select", type: ComponentType.UserSelect, values: ["u1"] },
  { custom_id: "role-select", type: ComponentType.RoleSelect, values: ["r1"] },
  { custom_id: "mentionable-select", type: ComponentType.MentionableSelect, values: ["u1", "r1"] },
  { custom_id: "channel-select", type: ComponentType.ChannelSelect, values: ["c1"] },
  { custom_id: "file-upload", type: ComponentType.FileUpload, values: ["f1"] },
  { custom_id: "radio-group", type: ComponentType.RadioGroup, value: "yes" },
  { custom_id: "checkbox-group", type: ComponentType.CheckboxGroup, values: ["x"] },
  { custom_id: "checkbox", type: ComponentType.Checkbox, value: true },
];

const resolved: APIInteractionDataResolved = {
  users: { u1: { id: "u1" } as APIUser },
  roles: { r1: { id: "r1" } as APIRole },
  channels: { c1: { id: "c1" } as APIInteractionDataResolvedChannel },
  attachments: { f1: { id: "f1" } as APIAttachment },
};

const getters: (keyof FieldValueGetters)[] = [
  "stringSelect",
  "textInput",
  "userSelect",
  "roleSelect",
  "mentionableSelect",
  "channelSelect",
  "fileUpload",
  "radioGroup",
  "checkboxGroup",
  "checkbox",
];

describe("getField", () => {
  for (const getter of getters) {
    const split = getter.replace(/(.)([A-Z])/g, "$1 $2").toLowerCase();
    const customId = split.replaceAll(" ", "-");
    const field = getField(customId, true, fields, resolved);
    test(split, () => expect(field[getter]()).toMatchSnapshot());
    for (const wrongGetter of getters) {
      if (wrongGetter === getter) continue;
      test(`getter "${wrongGetter}" throws on ${split}`, () => {
        expect(() => field[wrongGetter]()).toThrow(
          `The field "${customId}" is a ${split}, not a ${wrongGetter.replace(/(.)([A-Z])/g, "$1 $2").toLowerCase()}`,
        );
      });
    }
  }
});

describe("missing resolved data", () => {
  test("no resolved object", () => {
    expect(() => getField("user-select", true, fields).userSelect()).toThrow('No users found for field "user-select"');
  });
  test("mentionable select with no resolved object", () => {
    expect(() => getField("mentionable-select", true, fields).mentionableSelect()).toThrow(
      'No mentionables found for field "mentionable-select"',
    );
  });
});

describe("missing fields", () => {
  test("required missing throws", () => {
    expect(() => getField("missing", true, fields)).toThrow('Required field "missing" not found');
  });
  test("optional missing returns undefined", () => {
    expect(getField("missing", false, fields)).toBeUndefined();
  });
});
