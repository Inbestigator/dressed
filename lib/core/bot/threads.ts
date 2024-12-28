import type {
  APIThreadChannel,
  RESTPostAPIChannelThreadsJSONBody,
  RESTPostAPIGuildForumThreadsJSONBody,
  Snowflake,
} from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { callDiscord } from "../../internal/utils.ts";

/**
 * Creates a new thread, include a message to start the thread from that message.
 * @param channel The channel to create the thread in
 * @param data The thread data
 * @param message The message to create the thread from
 */
export async function createThread(
  channel: Snowflake,
  data: Omit<RESTPostAPIChannelThreadsJSONBody, "type"> & {
    type?: "Public" | "Private" | number;
  },
  message?: Snowflake,
): Promise<APIThreadChannel> {
  let endpoint = Routes.threads(channel);
  if (message) {
    endpoint = Routes.threads(channel, message);
    delete data.type;
  } else {
    data.type = data.type === "Public" ? 11 : 12;
  }

  const res = await callDiscord(endpoint, {
    method: "POST",
    body: data,
  });

  return res.json();
}

/**
 * Creates a new forum thread.
 * @param channel The channel to create the thread in
 * @param data The thread data
 */
export async function createForumThread(
  channel: Snowflake,
  data: RESTPostAPIGuildForumThreadsJSONBody,
): Promise<APIThreadChannel> {
  const res = await callDiscord(Routes.threads(channel), {
    method: "POST",
    body: data,
  });

  return res.json();
}

/**
 * Adds a member to a thread. Requires the ability to send messages in the thread.
 * @param thread The thread to add the user to
 * @param user The user to add to the thread (defaults to self)
 */
export async function addThreadMember(
  thread: string,
  user?: Snowflake,
): Promise<void> {
  await callDiscord(Routes.threadMembers(thread, user ?? "@me"), {
    method: "PUT",
  });
}

/**
 * Removes a member from a thread. Requires the `MANAGE_THREADS` permission, or the creator of the thread if it is a `PRIVATE_THREAD`.
 * @param thread The thread to remove the user from
 * @param user The user to remove from the thread (defaults to self)
 */
export async function removeThreadMember(
  thread: string,
  user?: Snowflake,
): Promise<void> {
  await callDiscord(Routes.threadMembers(thread, user ?? "@me"), {
    method: "DELETE",
  });
}
