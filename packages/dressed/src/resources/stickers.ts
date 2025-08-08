import type {
  RESTGetAPIGuildStickerResult,
  RESTGetAPIGuildStickersResult,
  RESTGetAPIStickerPackResult,
  RESTGetStickerPacksResult,
  RESTPatchAPIGuildStickerJSONBody,
  RESTPatchAPIGuildStickerResult,
  RESTPostAPIGuildStickerFormDataBody,
  RESTPostAPIGuildStickerResult,
  Snowflake,
} from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { callDiscord } from "../utils/call-discord.ts";
import type { RawFile } from "../types/file.ts";

/**
 * Returns a sticker object for the given sticker ID.
 * @param sticker The sticker to get
 */
export async function getSticker(
  sticker: Snowflake,
): Promise<RESTGetAPIGuildStickerResult> {
  const res = await callDiscord(Routes.sticker(sticker), {
    method: "GET",
  });

  return res.json();
}

/**
 * Returns a list of available sticker packs.
 */
export async function listStickerPacks(): Promise<
  RESTGetStickerPacksResult["sticker_packs"]
> {
  const res = await callDiscord(Routes.stickerPacks(), {
    method: "GET",
  });

  return (await res.json()).sticker_packs;
}

/**
 * Returns a sticker pack object for the given sticker pack ID.
 * @param pack The pack to get the stickers from
 */
export async function getStickerPack(
  pack: Snowflake,
): Promise<RESTGetAPIStickerPackResult> {
  const res = await callDiscord(Routes.stickerPack(pack), {
    method: "GET",
  });

  return (await res.json()).sticker_packs;
}

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
 * Returns a sticker object for the given guild and sticker IDs.
 * @param guild The guild to get the sticker from
 * @param sticker The sticker to get
 */
export async function getGuildSticker(
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
 * @param guild The guild to create the sticker in
 * @param data The sticker data
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
 * @param data The new sticker data
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
    method: "DELETE",
  });
}
