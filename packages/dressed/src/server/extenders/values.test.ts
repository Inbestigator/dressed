import { describe, expect, test } from "bun:test";
import {
  type APIAttachment,
  type APIInteractionDataResolved,
  type APIInteractionDataResolvedChannel,
  type APIMessageComponentInteraction,
  type APIRole,
  type APIUser,
  ComponentType,
} from "discord-api-types/v10";
import { parseValues } from "./values.ts";

const resolved: APIInteractionDataResolved = {
  users: { u1: { id: "u1" } as APIUser },
  roles: { r1: { id: "r1" } as APIRole },
  channels: { c1: { id: "c1" } as APIInteractionDataResolvedChannel },
  attachments: { f1: { id: "f1" } as APIAttachment },
};

const data = {
  StringSelect: ["test"],
  UserSelect: ["u1"],
  RoleSelect: ["r1"],
  MentionableSelect: ["u1", "r1"],
  ChannelSelect: ["c1"],
} as Record<keyof typeof ComponentType, string[]>;

describe("parseValues", () => {
  for (const [type, values] of Object.entries(data) as [keyof typeof ComponentType, string[]][]) {
    test(type, () => {
      expect(
        parseValues({
          data: { component_type: ComponentType[type], resolved, values },
        } as APIMessageComponentInteraction),
      ).toMatchSnapshot();
    });
    if (type !== "StringSelect") {
      test(`${type} missing resolved data`, () => {
        expect(() =>
          parseValues({
            data: { component_type: ComponentType[type], resolved: {}, values },
          } as APIMessageComponentInteraction),
        ).toThrow(`No ${type.toLowerCase().slice(0, -6)}s found`);
      });
    }
  }
});
