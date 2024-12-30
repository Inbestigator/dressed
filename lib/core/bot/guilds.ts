import type {
  RESTGetAPIGuildChannelsResult,
  RESTGetAPIGuildMemberResult,
  RESTGetAPIGuildMembersQuery,
  RESTGetAPIGuildMembersResult,
  RESTGetAPIGuildQuery,
  RESTGetAPIGuildResult,
  Snowflake,
} from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { callDiscord } from "../../internal/utils.ts";

/**
 * Get a guild by ID.
 * @param guild The guild to fetch
 * @param options Optional parameters for the request
 */
export async function getGuild(
  guild: Snowflake,
  options?: RESTGetAPIGuildQuery,
): Promise<RESTGetAPIGuildResult> {
  const res = await callDiscord(
    Routes.guild(guild),
    {
      method: "GET",
      params: options as Record<string, unknown>,
    },
  );

  return res.json();
}

/**
 * Get a list of channels in a guild, does not include threads
 * @param guild The guild to get the channels from
 */
export async function listChannels(
  guild: Snowflake,
): Promise<RESTGetAPIGuildChannelsResult> {
  const res = await callDiscord(Routes.guildChannels(guild), {
    method: "GET",
  });

  return res.json();
}

/**
 * Get a specific member from a guild
 * @param guild The guild to get the member from
 * @param member The member to get
 */
export async function getMember(
  guild: Snowflake,
  member: string,
): Promise<RESTGetAPIGuildMemberResult> {
  const res = await callDiscord(Routes.guildMember(guild, member), {
    method: "GET",
  });

  return res.json();
}

/**
 * Get a list of members in a guild
 * @param guild The guild to get the members from
 * @param options Optional parameters for the request
 */
export async function listMembers(
  guild: Snowflake,
  options?: RESTGetAPIGuildMembersQuery,
): Promise<RESTGetAPIGuildMembersResult> {
  const res = await callDiscord(Routes.guildMembers(guild), {
    method: "GET",
    params: options as Record<string, unknown>,
  });

  return res.json();
}
