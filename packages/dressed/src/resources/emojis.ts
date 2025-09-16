import type {
  RESTGetAPIApplicationEmojiResult,
  RESTGetAPIApplicationEmojisResult,
  RESTGetAPIGuildEmojiResult,
  RESTGetAPIGuildEmojisResult,
  RESTPatchAPIGuildEmojiJSONBody,
  RESTPatchAPIGuildEmojiResult,
  RESTPostAPIGuildEmojiJSONBody,
  RESTPostAPIGuildEmojiResult,
  Snowflake,
} from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { callDiscord } from "../utils/call-discord.ts";
import { botEnv } from "../utils/env.ts";

/**
 * Returns a list of emoji objects for the given guild.
 * @param guild The guild to get the emojis from
 */
export async function listEmojis(guild: Snowflake): Promise<RESTGetAPIGuildEmojisResult> {
  const res = await callDiscord(Routes.guildEmojis(guild), {
    method: "GET",
  });

  return res.json();
}

/**
 * Returns an emoji object for the given guild and emoji.
 * @param guild The guild to get the emoji from
 * @param emoji The emoji to get
 */
export async function getEmoji(guild: Snowflake, emoji: Snowflake): Promise<RESTGetAPIGuildEmojiResult> {
  const res = await callDiscord(Routes.guildEmoji(guild, emoji), {
    method: "GET",
  });

  return res.json();
}

/**
 * Create a new emoji for the guild.
 * @param guild The guild to create the emoji for
 * @param data The data for the new emoji
 */
export async function createEmoji(
  guild: Snowflake,
  data: RESTPostAPIGuildEmojiJSONBody,
): Promise<RESTPostAPIGuildEmojiResult> {
  const res = await callDiscord(Routes.guildEmojis(guild), {
    method: "POST",
    body: data,
  });

  return res.json();
}

/**
 * Modify the given guild emoji.
 * @param guild The guild to modify the emoji in
 * @param emoji The emoji to modify
 * @param data The new data for the emoji
 */
export async function modifyEmoji(
  guild: Snowflake,
  emoji: Snowflake,
  data: RESTPatchAPIGuildEmojiJSONBody,
): Promise<RESTPatchAPIGuildEmojiResult> {
  const res = await callDiscord(Routes.guildEmoji(guild, emoji), {
    method: "PATCH",
    body: data,
  });

  return res.json();
}

/**
 * Delete the given guild emoji.
 * @param guild The guild to delete the emoji from
 * @param emoji The emoji to delete
 */
export async function deleteEmoji(guild: Snowflake, emoji: Snowflake): Promise<void> {
  await callDiscord(Routes.guildEmoji(guild, emoji), {
    method: "DELETE",
  });
}

/**
 * Returns an object containing a list of emoji objects for the given application.
 */
export async function listApplicationEmojis(): Promise<RESTGetAPIApplicationEmojisResult["items"]> {
  const res = await callDiscord(Routes.applicationEmojis(botEnv.DISCORD_APP_ID), {
    method: "GET",
  });

  return (await res.json()).items;
}

/**
 * Returns an emoji object for the given application and emoji IDs.
 * @param emoji The emoji to get
 */
export async function getApplicationEmoji(emoji: Snowflake): Promise<RESTGetAPIApplicationEmojiResult> {
  const res = await callDiscord(Routes.applicationEmoji(botEnv.DISCORD_APP_ID, emoji), {
    method: "GET",
  });

  return res.json();
}

/**
 * Create a new emoji for the application.
 * @param data The data for the new emoji
 */
export async function createApplicationEmoji(
  data: RESTPostAPIGuildEmojiJSONBody,
): Promise<RESTPostAPIGuildEmojiResult> {
  const res = await callDiscord(Routes.applicationEmojis(botEnv.DISCORD_APP_ID), {
    method: "POST",
    body: data,
  });

  return res.json();
}

/**
 * Modify the given emoji.
 * @param emoji The emoji to modify
 * @param data The new data for the emoji
 */
export async function modifyApplicationEmoji(
  emoji: Snowflake,
  data: RESTPatchAPIGuildEmojiJSONBody,
): Promise<RESTPatchAPIGuildEmojiResult> {
  const res = await callDiscord(Routes.applicationEmoji(botEnv.DISCORD_APP_ID, emoji), {
    method: "PATCH",
    body: data,
  });

  return res.json();
}

/**
 * Delete the given emoji.
 * @param emoji The emoji to delete
 */
export async function deleteApplicationEmoji(emoji: Snowflake): Promise<void> {
  await callDiscord(Routes.applicationEmoji(botEnv.DISCORD_APP_ID, emoji), {
    method: "DELETE",
  });
}
