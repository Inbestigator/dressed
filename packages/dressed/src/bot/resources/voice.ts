import type {
  RESTGetAPIGuildVoiceStateUserResult,
  RESTGetAPIVoiceRegionsResult,
  RESTPatchAPIGuildVoiceStateCurrentMemberJSONBody,
  RESTPatchAPIGuildVoiceStateUserJSONBody,
  Snowflake,
} from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { callDiscord } from "../../utils/call-discord.ts";

/**
 * Returns an array of voice region objects that can be used when setting a voice or stage channel's rtc_region.
 */
export async function listVoiceRegions(): Promise<RESTGetAPIVoiceRegionsResult> {
  const res = await callDiscord(Routes.voiceRegions(), {
    method: "GET",
  });

  return res.json();
}

/**
 * Get a user's current voice state.
 * @param guild The guild to get from
 * @param user The user to get the voice state for (defaults to self)
 */
export async function getVoiceState(
  guild: Snowflake,
  user?: Snowflake,
): Promise<RESTGetAPIGuildVoiceStateUserResult> {
  const res = await callDiscord(Routes.guildVoiceState(guild, user), {
    method: "GET",
  });

  return res.json();
}

/**
 * Update a user's voice state.
 * @param guild The guild to update in
 * @param user The user to set the voice state of
 * @param data The new voice state data
 */
export async function modifyVoiceState(
  guild: Snowflake,
  user: Snowflake,
  data:
    | RESTPatchAPIGuildVoiceStateCurrentMemberJSONBody
    | RESTPatchAPIGuildVoiceStateUserJSONBody,
): Promise<void> {
  await callDiscord(Routes.guildVoiceState(guild, user), {
    method: "PATCH",
    body: data,
  });
}
