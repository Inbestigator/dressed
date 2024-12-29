import type {
  APIEmoji,
  RESTPatchAPIGuildEmojiJSONBody,
  RESTPostAPIGuildEmojiJSONBody,
  Snowflake,
} from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { callDiscord } from "../../internal/utils.ts";
import process from "node:process";

const appId = process.env.APP_ID;

/**
 * Returns a list of emoji objects for the given guild.
 * @param guild The guild to get the emojis from. If not provided, the bot's emojis are returned.
 */
export async function listEmojis(
  guild?: Snowflake,
): Promise<APIEmoji[]> {
  const res = await callDiscord(
    guild
      ? Routes.guildEmojis(guild)
      : Routes.applicationEmojis(appId as string),
    {
      method: "GET",
    },
  );

  if (!guild) {
    return (await res.json()).items;
  }

  return res.json();
}

/**
 * Returns an emoji object for the given guild and emoji.
 * @param emoji The emoji to get
 * @param guild The guild to get the emoji from. If not provided, the emoji is fetched from the bot.
 */
export async function getEmoji(
  emoji: Snowflake,
  guild?: Snowflake,
): Promise<APIEmoji> {
  const res = await callDiscord(
    guild
      ? Routes.guildEmoji(guild, emoji)
      : Routes.applicationEmoji(appId as string, emoji),
    {
      method: "GET",
    },
  );

  return res.json();
}

/**
 * Create a new emoji for the guild.
 * @param data The data for the new emoji
 * @param guild The guild to create the emoji for. If not provided, the emoji is created for the bot.
 */
export async function createEmoji(
  data: RESTPostAPIGuildEmojiJSONBody,
  guild?: Snowflake,
): Promise<APIEmoji> {
  const res = await callDiscord(
    guild
      ? Routes.guildEmojis(guild)
      : Routes.applicationEmojis(appId as string),
    {
      method: "POST",
      body: data,
    },
  );

  return res.json();
}

/**
 * Modify the given guild emoji.
 * @param emoji The emoji to modify
 * @param data The new data for the emoji
 * @param guild The guild to modify the emoji in. If not provided, the emoji is modified for the bot.
 */
export async function modifyEmoji(
  emoji: Snowflake,
  data: RESTPatchAPIGuildEmojiJSONBody,
  guild?: Snowflake,
): Promise<APIEmoji> {
  const res = await callDiscord(
    guild
      ? Routes.guildEmoji(guild, emoji)
      : Routes.applicationEmoji(appId as string, emoji),
    {
      method: "PATCH",
      body: data,
    },
  );

  return res.json();
}

/**
 * Delete the given guild emoji.
 * @param emoji The emoji to delete
 * @param guild The guild to delete the emoji from. If not provided, the emoji is deleted from the bot.
 */
export async function deleteEmoji(
  emoji: Snowflake,
  guild?: Snowflake,
): Promise<void> {
  await callDiscord(
    guild
      ? Routes.guildEmoji(guild, emoji)
      : Routes.applicationEmoji(appId as string, emoji),
    {
      method: "DELETE",
    },
  );
}
