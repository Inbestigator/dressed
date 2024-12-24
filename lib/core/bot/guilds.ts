import type {
  APIChannel,
  APIGuild,
  APIGuildMember,
} from "discord-api-types/v10";
import { callDiscord } from "../../internal/utils.ts";

/**
 * Get a guild by ID.
 * @param guild The guild to fetch
 * @param with_counts Whether to include member and presence counts in the response
 */
export async function getGuild(
  guild: string,
  with_counts?: boolean,
): Promise<APIGuild> {
  const res = await callDiscord(`guilds/${guild}?with_counts=${with_counts}`, {
    method: "GET",
  });

  return res.json();
}

/**
 * Get a list of channels in a guild, does not include threads
 * @param guild The guild to get the channels from
 */
export async function listChannels(guild: string): Promise<APIChannel[]> {
  const res = await callDiscord(`guilds/${guild}/channels`, {
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
  guild: string,
  member: string,
): Promise<APIGuildMember> {
  const res = await callDiscord(`guilds/${guild}/members/${member}`, {
    method: "GET",
  });

  return res.json();
}

/**
 * Get a list of members in a guild
 * @param guild The guild to get the members from
 */
export async function listMembers(guild: string): Promise<APIGuildMember[]> {
  const res = await callDiscord(`guilds/${guild}/members`, {
    method: "GET",
  });

  return res.json();
}
