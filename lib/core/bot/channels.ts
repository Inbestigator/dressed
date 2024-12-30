import type {
  APIChannel,
  APIFollowedChannel,
  APIInvite,
  APIMessage,
  APIThreadChannel,
  APIThreadMember,
  RESTGetAPIChannelUsersThreadsArchivedResult,
  RESTPatchAPIChannelJSONBody,
  RESTPostAPIChannelInviteJSONBody,
  RESTPostAPIChannelThreadsJSONBody,
  RESTPostAPIGuildForumThreadsJSONBody,
  RESTPutAPIChannelPermissionJSONBody,
  RESTPutAPIChannelRecipientJSONBody,
  Snowflake,
} from "discord-api-types/v10";
import { RouteBases, Routes } from "discord-api-types/v10";
import { callDiscord } from "../../internal/utils.ts";
import type { RawFile } from "../../internal/types/file.ts";

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

/**
 * Edit the channel permission overwrites for a user or role in a channel.
 * @param channel The channel to affect
 * @param overwrite The permission overwrite to modify
 */
export async function modifyChannelPermissions(
  channel: Snowflake,
  overwrite: Snowflake,
  data: RESTPutAPIChannelPermissionJSONBody,
): Promise<void> {
  await callDiscord(Routes.channelPermission(channel, overwrite), {
    method: "PUT",
    body: data,
  });
}

/**
 * Get a list of invites for a channel.
 * @param channel The channel to fetch from
 */
export async function listChannelInvites(
  channel: Snowflake,
): Promise<APIInvite[]> {
  const res = await callDiscord(Routes.channelInvites(channel), {
    method: "GET",
  });

  return res.json();
}

/**
 * Create a new invite object for a channel.
 * @param channel The channel to create the invite for
 */
export async function createChannelInvite(
  channel: Snowflake,
  data: RESTPostAPIChannelInviteJSONBody,
): Promise<APIInvite[]> {
  const res = await callDiscord(Routes.channelInvites(channel), {
    method: "GET",
    body: data,
  });

  return res.json();
}

/**
 * Delete a channel permission overwrite for a user or role in a channel.
 * @param channel The channel to affect
 * @param overwrite The permission overwrite to delete
 */
export async function deleteChannelPermissions(
  channel: Snowflake,
  overwrite: Snowflake,
): Promise<void> {
  await callDiscord(Routes.channelPermission(channel, overwrite), {
    method: "DELETE",
  });
}

/**
 * Follow an Announcement Channel to send messages to a target channel.
 * @param channel The announcement channel to follow
 * @param target The target channel to send messages to
 */
export async function followChannel(
  channel: Snowflake,
  target: Snowflake,
): Promise<APIFollowedChannel> {
  const res = await callDiscord(Routes.channelFollowers(channel), {
    method: "POST",
    body: { webhook_channel_id: target },
  });

  return res.json();
}

/**
 * Sends a typing indicator for the specified channel, which expires after 10 seconds.
 * @param channel The channel to start typing in
 */
export async function createTypingIndicator(
  channel: Snowflake,
): Promise<void> {
  await callDiscord(Routes.channelTyping(channel), {
    method: "POST",
  });
}

/**
 * Returns all pinned messages in the channel.
 * @param channel The channel to find the pins for
 */
export async function listPins(
  channel: Snowflake,
): Promise<APIMessage[]> {
  const res = await callDiscord(Routes.channelPins(channel), {
    method: "GET",
  });

  return res.json();
}

/**
 * Pin a message in a channel.
 * @param channel The channel to pin the message in
 * @param message The message to pin
 */
export async function createPin(
  channel: Snowflake,
  message: Snowflake,
): Promise<void> {
  await callDiscord(Routes.channelPin(channel, message), {
    method: "PUT",
  });
}

/**
 * Unpin a message in a channel.
 * @param channel The channel to unpin the message in
 * @param message The message to unpin
 */
export async function deletePin(
  channel: Snowflake,
  message: Snowflake,
): Promise<void> {
  await callDiscord(Routes.channelPin(channel, message), {
    method: "DELETE",
  });
}

/**
 * Adds a recipient to a Group DM using their access token.
 * @param channel The channel to add the recipient to
 * @param user The user to add
 */
export async function addGDMMember(
  channel: Snowflake,
  user: Snowflake,
  data: RESTPutAPIChannelRecipientJSONBody,
): Promise<void> {
  await callDiscord(Routes.channelRecipient(channel, user), {
    method: "PUT",
    body: data,
  });
}

/**
 * Removes a recipient to a Group DM.
 * @param channel The channel to remove the recipient from
 * @param user The user remove
 */
export async function removeGDMMember(
  channel: Snowflake,
  user: Snowflake,
): Promise<void> {
  await callDiscord(Routes.channelRecipient(channel, user), {
    method: "DELETE",
  });
}

/**
 * Creates a new thread, include a message ID to start the thread from that message.
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
  data: RESTPostAPIGuildForumThreadsJSONBody & {
    files?: RawFile[];
  },
): Promise<APIThreadChannel> {
  const res = await callDiscord(Routes.threads(channel), {
    method: "POST",
    body: data,
  });

  return res.json();
}

/**
 * Adds a member to a thread.
 * @param thread The thread to add the user to
 * @param user The user to add to the thread (defaults to self)
 */
export async function addThreadMember(
  thread: Snowflake,
  user?: Snowflake,
): Promise<void> {
  await callDiscord(Routes.threadMembers(thread, user ?? "@me"), {
    method: "PUT",
  });
}

/**
 * Removes a member from a thread.
 * @param thread The thread to remove the user from
 * @param user The user to remove from the thread (defaults to self)
 */
export async function removeThreadMember(
  thread: Snowflake,
  user?: Snowflake,
): Promise<void> {
  await callDiscord(Routes.threadMembers(thread, user ?? "@me"), {
    method: "DELETE",
  });
}

/**
 * Returns a thread member object if the user is a member of the thread.
 * @param thread The thread to get the user from
 * @param user The user to get from the thread
 */
export async function getThreadMember(
  thread: Snowflake,
  user: Snowflake,
): Promise<APIThreadMember> {
  const res = await callDiscord(
    Routes.threadMembers(thread, user),
    {
      method: "GET",
    },
  );

  return res.json();
}

/**
 * Returns a list of thread members in the thread.
 * @param thread The thread to get from
 */
export async function listThreadMembers(
  thread: Snowflake,
): Promise<APIThreadMember[]> {
  const res = await callDiscord(Routes.threadMembers(thread), {
    method: "GET",
  });

  return res.json();
}

/**
 * Returns a list of archived threads in the channel. Alternatively, returns a list of joined private threads in the channel.
 * @param channel The channel to get from
 * @param publicThreads Whether to get public or private threads
 * @param joinedOnly Whether to only return private threads the user has joined (will force publicThreads to false)
 * @param options Optional query parameters
 */
export async function listArchivedThreads(
  channel: Snowflake,
  publicThreads: boolean,
  joinedOnly?: boolean,
  options?: {
    /** Returns threads archived before this timestamp */
    before?: string;
    /** Optional maximum number of threads to return */
    limit?: number;
  },
): Promise<RESTGetAPIChannelUsersThreadsArchivedResult> {
  const url = new URL(
    joinedOnly
      ? Routes.channelThreads(channel, publicThreads ? "public" : "private")
      : Routes.channelJoinedArchivedThreads(channel),
    RouteBases.api,
  );
  if (options?.before) url.searchParams.append("before", options.before);
  if (options?.limit) {
    url.searchParams.append("limit", options.limit.toString());
  }

  const res = await callDiscord(
    url.toString(),
    {
      method: "GET",
    },
  );

  return res.json();
}
