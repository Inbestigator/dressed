import type {
  APIChannel,
  APIGuild,
  APIGuildMember,
  Snowflake,
} from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { callDiscord } from "../../internal/utils.ts";

/**
 * Get a guild by ID.
 * @param guild The guild to fetch
 * @param with_counts Whether to include member and presence counts in the response
 */
export async function getGuild(
  guild: Snowflake,
  with_counts?: boolean,
): Promise<APIGuild> {
  const res = await callDiscord(Routes.guild(guild), {
    method: "GET",
    body: { with_counts },
  });

  return res.json();
}

/**
 * Get a list of channels in a guild, does not include threads
 * @param guild The guild to get the channels from
 */
export async function listChannels(guild: Snowflake): Promise<APIChannel[]> {
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
): Promise<APIGuildMember> {
  const res = await callDiscord(Routes.guildMember(guild, member), {
    method: "GET",
  });

  return res.json();
}

/**
 * Get a list of members in a guild
 * @param guild The guild to get the members from
 */
export async function listMembers(guild: Snowflake): Promise<APIGuildMember[]> {
  const res = await callDiscord(Routes.guildMembers(guild), {
    method: "GET",
  });

  return res.json();
}
