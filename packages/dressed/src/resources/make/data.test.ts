import { describe, expect, test } from "bun:test";
import { routeKeyToMethodName } from "./data.ts";

const testRoutes: Record<string, Parameters<typeof routeKeyToMethodName>> = {
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
  for (const [expected, params] of Object.entries(testRoutes)) {
    test(expected, () => {
      expect(routeKeyToMethodName(...params)).toBe(expected);
    });
  }
});
