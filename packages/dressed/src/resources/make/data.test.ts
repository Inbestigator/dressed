import { describe, expect, test } from "bun:test";
import { Routes } from "discord-api-types/v10";
import routeDefinitions, { routeKeyToMethodName } from "./data.ts";

const excused = new Set([
  // Deprecated:
  "channelPin",
  "guildCurrentMemberNickname",
  "nitroStickerPacks",
  // Only sent from Slack/Github:
  "webhookPlatform",
  // Used, but not recognized:
  "channelJoinedArchivedThreads",
  "channelPins",
  "channelThreads",
  "guildMFA",
  "guilds",
  "interactionCallback",
  "soundboardDefaultSounds",
  // TODO:
  "guildMemberVerification", // Documentation removed temporarily and API changing
  "oauth2CurrentApplication",
  "oauth2CurrentAuthorization",
  "oauth2Authorization",
  "oauth2TokenExchange",
  "oauth2TokenRevocation",
]);

test("should have no missing and unexcused routes", () => {
  const unused = new Set(Object.keys(Routes));
  for (const [key, { overrides: { apiRoute } = {} }] of Object.entries(routeDefinitions)) {
    const method = (key.match(/[A-Z][a-z]+/) ?? [])[0] ?? "";
    const routeKey = apiRoute ?? key.slice(method.length).replace("API", "");
    unused.delete(`${routeKey[0].toLowerCase()}${routeKey.slice(1)}`);
  }
  expect(Array.from(unused).filter((r) => !excused.has(r))).toBeEmpty();
});

const routeCases: Record<string, Parameters<typeof routeKeyToMethodName>> = {
  listRoutes: ["Get", "GetAPIRoutes"],
  getUser: ["Get", "GetAPIUser"],
  listRoles: ["Get", "GetAPIGuildRoles"],
  createRole: ["Post", "PostAPIGuildRole"],
  addMemberRole: ["Put", "PutAPIMemberRole", 0],
  modifyUser: ["Patch", "PatchAPIUser"],
  deleteUser: ["Delete", "DeleteAPIUser"],
  deleteMemberRole: ["Delete", "DeleteAPIMemberRoles", 0],
  modifyUserSetting: ["Patch", "PatchAPIUserSettings", 0],
};

describe("routeKeyToMethodName", () => {
  for (const [expected, params] of Object.entries(routeCases)) {
    test(expected, () => {
      expect(routeKeyToMethodName(...params)).toBe(expected);
    });
  }
});
