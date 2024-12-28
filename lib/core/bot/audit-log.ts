import {
  type APIAuditLog,
  Routes,
  type Snowflake,
} from "discord-api-types/v10";
import { callDiscord } from "../../internal/utils.ts";

/**
 * Get a guild's audit log.
 * @param guild The guild to get the audit log from
 */
export async function getAuditLog(guild: Snowflake): Promise<APIAuditLog> {
  const res = await callDiscord(Routes.guildAuditLog(guild), {
    method: "GET",
  });

  return res.json();
}
