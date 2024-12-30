import type {
  APISticker,
  RESTPatchAPIGuildStickerJSONBody,
  Snowflake,
} from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { callDiscord } from "../../internal/utils.ts";
import type { RawFile } from "../../internal/types/file.ts";

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

/**
 * https://discord.com/developers/docs/resources/sticker#create-guild-sticker
 */
interface RESTPostAPIGuildStickerFormDataBody {
  /**
   * Name of the sticker (2-30 characters)
   */
  name: string;
  /**
   * Description of the sticker (empty or 2-100 characters)
   */
  description: string;
  /**
   * The Discord name of a unicode emoji representing the sticker's expression (2-200 characters)
   */
  tags: string;
  /**
   * The sticker file to upload, must be a PNG, APNG, GIF, or Lottie JSON file, max 512 KB
   *
   * Uploaded stickers are constrained to 5 seconds in length for animated stickers, and 320 x 320 pixels.
   */
  file: Blob;
}

/**
 * Create a new sticker for the guild.
 * @param guild The guild to create the sticker from
 */
export async function createSticker(
  guild: Snowflake,
  { file, ...data }: Omit<RESTPostAPIGuildStickerFormDataBody, "file"> & {
    file: RawFile;
  },
): Promise<APISticker> {
  const res = await callDiscord(
    Routes.guildStickers(guild),
    {
      method: "POST",
      body: data,
      flattenBodyInForm: true,
      files: [{ ...file, key: "file" }],
    },
  );

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
): Promise<APISticker> {
  const res = await callDiscord(
    Routes.guildSticker(guild, sticker),
    {
      method: "PATCH",
      body: data,
    },
  );

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
  await callDiscord(
    Routes.guildSticker(guild, sticker),
    {
      method: "PATCH",
    },
  );
}
