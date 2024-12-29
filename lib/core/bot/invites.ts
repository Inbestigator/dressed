import type { APIInvite, Snowflake } from "discord-api-types/v10";
import { RouteBases, Routes } from "discord-api-types/v10";
import { callDiscord } from "../../internal/utils.ts";

/**
 * Returns an invite object for the given code.
 * @param invite The invite code to get
 * @param options Query parameters for the invite
 */
export async function getInvite(invite: string, options?: {
  /** Whether the invite should contain approximate member counts */
  with_counts?: boolean;
  /** Whether the invite should contain the expiration date */
  with_expiration?: boolean;
  /** The guild scheduled event to include with the invite */
  guild_scheduled_event_id?: Snowflake;
}): Promise<APIInvite> {
  const url = new URL(Routes.invite(invite), RouteBases.api);

  if (options?.with_counts !== undefined) {
    url.searchParams.append("with_counts", String(options.with_counts));
  }
  if (options?.with_expiration !== undefined) {
    url.searchParams.append("with_expiration", String(options.with_expiration));
  }
  if (options?.guild_scheduled_event_id) {
    url.searchParams.append(
      "guild_scheduled_event_id",
      options.guild_scheduled_event_id,
    );
  }

  const res = await callDiscord(
    url.toString(),
    {
      method: "GET",
    },
  );

  return res.json();
}

/**
 * Delete an invite.
 * @param invite The invite code to delete
 */
export async function deleteInvite(invite: string): Promise<APIInvite> {
  const res = await callDiscord(
    Routes.invite(invite),
    {
      method: "DELETE",
    },
  );

  return res.json();
}
