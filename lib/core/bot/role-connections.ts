import {
  type APIApplicationRoleConnectionMetadata,
  Routes,
} from "discord-api-types/v10";
import { callDiscord } from "../../internal/utils.ts";
import process from "node:process";

const appId = process.env.APP_ID;

/**
 * Get a list of application role connection metadata records
 */
export async function listAppRoleConnectionMetadata(): Promise<
  APIApplicationRoleConnectionMetadata[]
> {
  const res = await callDiscord(
    Routes.applicationRoleConnectionMetadata(appId as string),
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
  data: APIApplicationRoleConnectionMetadata[],
): Promise<
  APIApplicationRoleConnectionMetadata[]
> {
  const res = await callDiscord(
    Routes.applicationRoleConnectionMetadata(appId as string),
    {
      method: "PUT",
      body: data,
    },
  );

  return res.json();
}
