import type {
  RESTGetAPIGuildStickerResult,
  RESTGetAPIGuildStickersResult,
  RESTPatchAPIGuildStickerJSONBody,
  RESTPatchAPIGuildStickerResult,
  RESTPostAPIGuildStickerFormDataBody,
  RESTPostAPIGuildStickerResult,
  Snowflake,
} from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { callDiscord } from "../utils.ts";
import type { RawFile } from "../../types/file.ts";

/**
 * Returns an array of sticker objects.
 * @param guild The guild to get the stickers from
 */
export async function listStickers(
  guild: Snowflake,
): Promise<RESTGetAPIGuildStickersResult> {
  const res = await callDiscord(Routes.guildStickers(guild), {
    method: "GET",
  });

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
): Promise<RESTGetAPIGuildStickerResult> {
  const res = await callDiscord(Routes.guildSticker(guild, sticker), {
    method: "GET",
  });

  return res.json();
}

/**
 * Create a new sticker for the guild.
 * @param guild The guild to create the sticker from
 */
export async function createSticker(
  guild: Snowflake,
  {
    file,
    ...data
  }: Omit<RESTPostAPIGuildStickerFormDataBody, "file"> & {
    file: RawFile;
  },
): Promise<RESTPostAPIGuildStickerResult> {
  const res = await callDiscord(Routes.guildStickers(guild), {
    method: "POST",
    body: data,
    flattenBodyInForm: true,
    files: [{ ...file, key: "file" }],
  });

  return res.json();
}

/**
 * Modify the given sticker.
 * @param guild The guild the sticker is in
 * @param sticker The sticker to modify
 */
export async function modifySticker(
  guild: Snowflake,
  sticker: Snowflake,
  data: RESTPatchAPIGuildStickerJSONBody,
): Promise<RESTPatchAPIGuildStickerResult> {
  const res = await callDiscord(Routes.guildSticker(guild, sticker), {
    method: "PATCH",
    body: data,
  });

  return res.json();
}

/**
 * Delete the given sticker.
 * @param guild The guild the sticker is in
 * @param sticker The sticker to delete
 */
export async function deleteSticker(
  guild: Snowflake,
  sticker: Snowflake,
): Promise<void> {
  await callDiscord(Routes.guildSticker(guild, sticker), {
    method: "PATCH",
  });
}
