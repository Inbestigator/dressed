import type {
  RESTDeleteAPIInviteResult,
  RESTGetAPIInviteQuery,
  RESTGetAPIInviteResult,
} from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { callDiscord } from "../../internal/utils.ts";

/**
 * Returns an invite object for the given code.
 * @param invite The invite code to get
 * @param options Optional parameters for the request
 */
export async function getInvite(
  invite: string,
  options?: RESTGetAPIInviteQuery,
): Promise<RESTGetAPIInviteResult> {
  const res = await callDiscord(
    Routes.invite(invite),
    {
      method: "GET",
      params: options as Record<string, unknown>,
    },
  );

  return res.json();
}

/**
 * Delete an invite.
 * @param invite The invite code to delete
 */
export async function deleteInvite(
  invite: string,
): Promise<RESTDeleteAPIInviteResult> {
  const res = await callDiscord(
    Routes.invite(invite),
    {
      method: "DELETE",
    },
  );

  return res.json();
}
