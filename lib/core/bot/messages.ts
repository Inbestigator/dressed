import type { APIMessage } from "discord-api-types/v10";
import type { MessageOptions } from "../../internal/types/messages.ts";
import { callDiscord } from "../../internal/utils.ts";

/**
 * Post a message to a guild text or DM channel.
 * @param channel The channel to post the message to
 * @param data The message data
 */
export async function createMessage(
  channel: string,
  data: string | MessageOptions,
): Promise<APIMessage> {
  if (typeof data === "string") {
    data = { content: data };
  }

  const res = await callDiscord(`channels/${channel}/messages`, {
    method: "POST",
    body: data,
  });

  return res.json();
}

/**
 * Edit a previously sent message.
 * @param channel The channel to edit the message in
 * @param message The snowflake of the message to edit
 * @param data The new message data
 */
export async function editMessage(
  channel: string,
  message: string,
  data: string | MessageOptions,
): Promise<APIMessage> {
  if (typeof data === "string") {
    data = { content: data };
  }

  const res = await callDiscord(`channels/${channel}/messages/${message}`, {
    method: "PATCH",
    body: data,
  });

  return res.json();
}

/**
 * Delete a message. If operating on a guild channel and trying to delete a message that was not sent by the current user, this endpoint requires the `MANAGE_MESSAGES` permission.
 * @param channel The channel to delete the message from
 * @param message The snowflake of the message to delete
 * @returns
 */
export async function deleteMessage(
  channel: string,
  message: string,
): Promise<APIMessage> {
  const res = await callDiscord(`channels/${channel}/messages/${message}`, {
    method: "DELETE",
  });

  return res.json();
}

/**
 * Delete multiple messages in a single request.
 * @param channel The channel to delete messages from
 * @param messages An array of snowflakes
 * @returns
 */
export async function bulkDelete(
  channel: string,
  messages: string[],
): Promise<APIMessage> {
  const res = await callDiscord(`channels/${channel}/messages/bulk-delete`, {
    method: "DELETE",
    body: { messages },
  });

  return res.json();
}
