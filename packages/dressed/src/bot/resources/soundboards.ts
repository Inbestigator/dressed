import type {
  RESTGetAPIGuildSoundboardSoundResult,
  RESTGetAPISoundboardDefaultSoundsResult,
  RESTPatchAPIGuildSoundboardSoundJSONBody,
  RESTPatchAPIGuildSoundboardSoundResult,
  RESTPostAPIGuildSoundboardSoundJSONBody,
  RESTPostAPIGuildSoundboardSoundResult,
  RESTPostAPISendSoundboardSoundResult,
  RESTPostAPISoundboardSendSoundJSONBody,
  Snowflake,
} from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { callDiscord } from "../utils.ts";

/**
 * Send a soundboard sound to a voice channel the user is connected to.
 * @param channel The channel to send the sound to
 * @param data The data for the sound to send
 */
export async function sendSound(
  channel: Snowflake,
  data: RESTPostAPISoundboardSendSoundJSONBody,
): Promise<RESTPostAPISendSoundboardSoundResult> {
  const res = await callDiscord(Routes.sendSoundboardSound(channel), {
    method: "POST",
    body: data,
  });

  return res.json();
}

/**
 * Returns an array of soundboard sound objects that can be used by all users.
 * @param guild Returns a list of this guild's soundboard sounds instead.
 */
export async function listSounds(
  guild?: Snowflake,
): Promise<RESTGetAPISoundboardDefaultSoundsResult> {
  const res = await callDiscord(
    guild
      ? Routes.guildSoundboardSounds(guild)
      : Routes.soundboardDefaultSounds(),
    {
      method: "GET",
    },
  );

  if (guild) {
    return (await res.json()).items;
  }

  return res.json();
}

/**
 * Returns a soundboard sound object for the given sound id.
 * @param guild The guild to get the sound from
 * @param sound The sound to get
 */
export async function getSound(
  guild: Snowflake,
  sound: Snowflake,
): Promise<RESTGetAPIGuildSoundboardSoundResult> {
  const res = await callDiscord(Routes.guildSoundboardSound(guild, sound), {
    method: "GET",
  });

  return res.json();
}

/**
 * Create a new soundboard sound for the guild.
 * @param guild The guild to create the sound in
 * @param data The data for the new sound
 */
export async function createSound(
  guild: Snowflake,
  data: RESTPostAPIGuildSoundboardSoundJSONBody,
): Promise<RESTPostAPIGuildSoundboardSoundResult> {
  const res = await callDiscord(Routes.guildSoundboardSounds(guild), {
    method: "POST",
    body: data,
  });

  return res.json();
}

/**
 * Modify the given soundboard sound.
 * @param guild The guild to modify the sound in
 * @param sound The sound to modify
 * @param data The new data for the sound
 */
export async function modifySound(
  guild: Snowflake,
  sound: Snowflake,
  data: RESTPatchAPIGuildSoundboardSoundJSONBody,
): Promise<RESTPatchAPIGuildSoundboardSoundResult> {
  const res = await callDiscord(Routes.guildSoundboardSound(guild, sound), {
    method: "PATCH",
    body: data,
  });

  return res.json();
}

/**
 * Delete the given soundboard sound.
 * @param guild The guild to delete the sound from
 * @param sound The sound to delete
 */
export async function deleteSound(
  guild: Snowflake,
  sound: Snowflake,
): Promise<void> {
  await callDiscord(Routes.guildSoundboardSound(guild, sound), {
    method: "DELETE",
  });
}
