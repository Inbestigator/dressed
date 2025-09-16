import type { RESTGetAPIAuditLogQuery, RESTGetAPIAuditLogResult, Snowflake } from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { callDiscord } from "../utils/call-discord.ts";

/**
 * Get a guild's audit log.
 * @param guild The guild to get the audit log from
 * @param options Optional parameters for the request
 */
export async function getAuditLog(
  guild: Snowflake,
  options?: RESTGetAPIAuditLogQuery,
): Promise<RESTGetAPIAuditLogResult> {
  const res = await callDiscord(Routes.guildAuditLog(guild), {
    method: "GET",
    params: options,
  });

  return res.json();
}
