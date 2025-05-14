import {
  type RESTGetAPIApplicationRoleConnectionMetadataResult,
  type RESTPutAPIApplicationRoleConnectionMetadataJSONBody,
  type RESTPutAPIApplicationRoleConnectionMetadataResult,
  Routes,
} from "discord-api-types/v10";
import { callDiscord } from "../utils.ts";
import { botEnv } from "../../env.ts";

/**
 * Get a list of application role connection metadata records
 */
export async function listAppRoleConnectionMetadata(): Promise<RESTGetAPIApplicationRoleConnectionMetadataResult> {
  const res = await callDiscord(
    Routes.applicationRoleConnectionMetadata(botEnv.DISCORD_APP_ID),
    {
      method: "GET",
    },
  );

  return res.json();
}

/**
 * Update a list of application role connection metadata records
 */
export async function modifyAppRoleConnectionMetadata(
  data: RESTPutAPIApplicationRoleConnectionMetadataJSONBody,
): Promise<RESTPutAPIApplicationRoleConnectionMetadataResult> {
  const res = await callDiscord(
    Routes.applicationRoleConnectionMetadata(botEnv.DISCORD_APP_ID),
    {
      method: "PUT",
      body: data,
    },
  );

  return res.json();
}
