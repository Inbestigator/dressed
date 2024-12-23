import type { APIChannel } from "discord-api-types/v10";
import { callDiscord } from "../../internal/utils.ts";

/**
 * Creates a new thread, include a message to start the thread from that message.
 * @param channel The channel to create the thread in
 * @param data The thread data
 * @param message The message to create the thread from
 */
export async function createThread(
  channel: string,
  data: {
    name: string;
    type?: "Private" | "Public" | number;
    auto_archive_duration?: number;
    invitable?: boolean;
    rate_limit_per_user?: number;
  },
  message?: string,
): Promise<APIChannel> {
  let endpoint = `channels/${channel}/threads`;
  if (message) {
    endpoint = `messages/${message}/messages/${message}/threads`;
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
 * Adds the current user to a thread.
 * @param thread The thread to join
 */
export async function joinThread(thread: string): Promise<void> {
  await callDiscord(`channels/${thread}/thread-members/@me`, {
    method: "PUT",
  });
}

/**
 * Adds another member to a thread. Requires the ability to send messages in the thread.
 * @param thread The thread to add the user to
 * @param user The user to add to the thread
 */
export async function addThreadMember(
  thread: string,
  user: string,
): Promise<void> {
  await callDiscord(`channels/${thread}/thread-members/${user}`, {
    method: "PUT",
  });
}

/**
 * Removes the current user from a thread.
 * @param thread The thread to leave
 */
export async function leaveThread(thread: string): Promise<void> {
  await callDiscord(`channels/${thread}/thread-members/@me`, {
    method: "DELETE",
  });
}

/**
 * Removes another member from a thread. Requires the `MANAGE_THREADS` permission, or the creator of the thread if it is a `PRIVATE_THREAD`.
 * @param thread The thread to remove the user from
 * @param user The user to remove from the thread
 */
export async function removeThreadMember(
  thread: string,
  user: string,
): Promise<void> {
  await callDiscord(`channels/${thread}/thread-members/${user}`, {
    method: "DELETE",
  });
}
