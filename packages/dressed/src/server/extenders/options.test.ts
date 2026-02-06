import { describe, expect, test } from "bun:test";
import {
  type APIApplicationCommandInteractionDataOption,
  type APIAttachment,
  type APIInteractionDataResolved,
  type APIInteractionDataResolvedChannel,
  type APIRole,
  type APIUser,
  ApplicationCommandOptionType,
} from "discord-api-types/v10";
import { getFocused, parseOptions } from "./options.ts";

const options: APIApplicationCommandInteractionDataOption[] = [
  { name: "subcommand", type: ApplicationCommandOptionType.Subcommand },
  {
    name: "subcommand-group",
    type: ApplicationCommandOptionType.SubcommandGroup,
    options: [{ name: "subcommand", type: ApplicationCommandOptionType.Subcommand }],
  },
  { name: "string", type: ApplicationCommandOptionType.String, value: "test" },
  { name: "integer", type: ApplicationCommandOptionType.Integer, value: -1 },
  { name: "boolean", type: ApplicationCommandOptionType.Boolean, value: true },
  { name: "user", type: ApplicationCommandOptionType.User, value: "u1" },
  { name: "channel", type: ApplicationCommandOptionType.Channel, value: "c1" },
  { name: "role", type: ApplicationCommandOptionType.Role, value: "r1" },
  { name: "mentionable", type: ApplicationCommandOptionType.Mentionable, value: "u1" },
  { name: "number", type: ApplicationCommandOptionType.Number, value: 0.5 },
  { name: "attachment", type: ApplicationCommandOptionType.Attachment, value: "f1" },
];

const resolved: APIInteractionDataResolved = {
  users: { u1: { id: "u1" } as APIUser },
  roles: { r1: { id: "r1" } as APIRole },
  channels: { c1: { id: "c1" } as APIInteractionDataResolvedChannel },
  attachments: { f1: { id: "f1" } as APIAttachment },
};

test("parseOptions", () => {
  expect(parseOptions(options, resolved)).toMatchSnapshot();
});

describe("missing resolved data", () => {
  test("no resolved object", () => {
    expect(() => parseOptions([options[5]])).toThrow('No users found for option "user"');
  });
  test("mentionable select with no resolved object", () => {
    expect(() => parseOptions([options[8]])).toThrow('No mentionables found for option "mentionable"');
  });
});

describe("getFocused", () => {
  test("returns focused option at top level", () => {
    const options: APIApplicationCommandInteractionDataOption[] = [
      { name: "query", type: ApplicationCommandOptionType.String, value: "test", focused: true },
    ];
    expect(getFocused(options)).toBe(".query");
  });

  test("returns focused option inside a subcommand", () => {
    const options: APIApplicationCommandInteractionDataOption[] = [
      {
        name: "search",
        type: ApplicationCommandOptionType.Subcommand,
        options: [{ name: "query", type: ApplicationCommandOptionType.String, value: "test", focused: true }],
      },
    ];
    expect(getFocused(options)).toBe(".search.query");
  });

  test("returns focused option inside a subcommand group", () => {
    const options: APIApplicationCommandInteractionDataOption[] = [
      {
        name: "admin",
        type: ApplicationCommandOptionType.SubcommandGroup,
        options: [
          {
            name: "ban",
            type: ApplicationCommandOptionType.Subcommand,
            options: [{ name: "reason", type: ApplicationCommandOptionType.String, value: "test", focused: true }],
          },
        ],
      },
    ];
    expect(getFocused(options)).toBe(".admin.ban.reason");
  });

  test("returns first focused option when multiple are present", () => {
    const options: APIApplicationCommandInteractionDataOption[] = [
      { name: "one", type: ApplicationCommandOptionType.String, value: "test", focused: true },
      { name: "two", type: ApplicationCommandOptionType.String, value: "test", focused: true },
    ];
    expect(getFocused(options)).toBe(".one");
  });

  test("returns undefined when no option is focused", () => {
    const options: APIApplicationCommandInteractionDataOption[] = [
      { name: "query", type: ApplicationCommandOptionType.String, value: "test" },
    ];
    expect(getFocused(options)).toBeUndefined();
  });

  test("returns undefined for empty options", () => {
    expect(getFocused([])).toBeUndefined();
  });
});
