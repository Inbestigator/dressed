import type { APISticker, Snowflake } from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { callDiscord } from "../../internal/utils.ts";

/**
 * Returns an array of sticker objects.
 * @param guild The guild to get the stickers from
 */
export async function listStickers(
  guild: Snowflake,
): Promise<APISticker[]> {
  const res = await callDiscord(
    Routes.guildStickers(guild),
    {
      method: "GET",
    },
  );

  return res.json();
}

/**
 * Returns data for a sticker.
 * @param guild The guild to get the sticker from
 * @param sticker The sticker to get
 */
export async function getSticker(
  guild: Snowflake,
  sticker: Snowflake,
): Promise<APISticker> {
  const res = await callDiscord(
    Routes.guildSticker(guild, sticker),
    {
      method: "GET",
    },
  );

  return res.json();
}
