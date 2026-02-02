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
import { parseOptions } from "./options.ts";

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

describe("parseOptions", () => {
  test("parseOptions", () => {
    expect(parseOptions(options, resolved)).toMatchSnapshot();
  });
});

describe("getField : missing resolved data", () => {
  test("no resolved object", () => {
    expect(() => parseOptions([options[5]])).toThrow('No users found for option "user"');
  });
  test("mentionable select with no resolved object", () => {
    expect(() => parseOptions([options[8]])).toThrow('No mentionables found for option "mentionable"');
  });
});
