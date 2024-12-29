import type {
  APIChannel,
  RESTPatchAPIChannelJSONBody,
  Snowflake,
} from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { callDiscord } from "../../internal/utils.ts";

/**
 * Get a channel by ID.
 * @param channel The channel to fetch
 */
export async function getChannel(channel: Snowflake): Promise<APIChannel> {
  const res = await callDiscord(Routes.channel(channel), {
    method: "GET",
  });

  return res.json();
}

/**
 * Update a channel's settings.
 * @param channel The channel to modify
 * @param data The new data for the channel
 */
export async function modifyChannel(
  channel: Snowflake,
  data: RESTPatchAPIChannelJSONBody,
): Promise<APIChannel> {
  const res = await callDiscord(Routes.channel(channel), {
    method: "PATCH",
    body: data,
  });

  return res.json();
}

/**
 * Delete a channel, or close a private message.
 * @param channel The channel to delete
 */
export async function deleteChannel(channel: Snowflake): Promise<APIChannel> {
  const res = await callDiscord(Routes.channel(channel), {
    method: "DELETE",
  });

  return res.json();
}
