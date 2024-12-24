import type {
  APIChannel,
  RESTPatchAPIChannelJSONBody,
} from "discord-api-types/v10";
import { callDiscord } from "../../internal/utils.ts";

/**
 * Get a channel by ID.
 * @param channel The channel to fetch
 */
export async function getChannel(channel: string): Promise<APIChannel> {
  const res = await callDiscord(`channels/${channel}`, {
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
  channel: string,
  data: RESTPatchAPIChannelJSONBody,
): Promise<APIChannel> {
  const res = await callDiscord(`channels/${channel}`, {
    method: "PATCH",
    body: data,
  });

  return res.json();
}

/**
 * Delete a channel, or close a private message.
 * @param channel The channel to delete
 */
export async function deleteChannel(channel: string): Promise<APIChannel> {
  const res = await callDiscord(`channels/${channel}`, {
    method: "DELETE",
  });

  return res.json();
}
