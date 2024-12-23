import type {
  APIChannel,
  APIGuildForumDefaultReactionEmoji,
  APIGuildForumTag,
  APIOverwrite,
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
  data: {
    /**
     * 1-100 character channel name.
     * Applicable to all channel types.
     */
    name?: string;
    /**
     * The type of channel; only conversion between text and announcement is supported
     * and only in guilds with the "NEWS" feature.
     * Applicable to Text and Announcement channels.
     */
    type?: number;
    /**
     * The position of the channel in the left-hand listing
     * (channels with the same position are sorted by id).
     * Applicable to all channel types.
     */
    position?: number;
    /**
     * 0-1024 character channel topic (0-4096 characters for GUILD_FORUM and GUILD_MEDIA channels).
     * Applicable to Text, Announcement, Forum, and Media channels.
     */
    topic?: string;
    /**
     * Whether the channel is marked as NSFW.
     * Applicable to Text, Voice, Announcement, Stage, Forum, and Media channels.
     */
    nsfw?: boolean;
    /**
     * Amount of seconds a user has to wait before sending another message (0-21600);
     * bots and users with manage_messages or manage_channel permissions are unaffected.
     * Applicable to Text, Voice, Stage, Forum, and Media channels.
     */
    rate_limit_per_user?: number;
    /**
     * The bitrate (in bits) of the voice or stage channel; minimum value is 8000.
     * Applicable to Voice and Stage channels.
     */
    bitrate?: number;
    /**
     * The user limit of the voice or stage channel; maximum is 99 for voice channels
     * and 10,000 for stage channels (0 refers to no limit).
     * Applicable to Voice and Stage channels.
     */
    user_limit?: number;
    /**
     * Channel or category-specific permissions.
     * Applicable to all channel types.
     */
    permission_overwrites?: APIOverwrite[];
    /**
     * ID of the new parent category for a channel.
     * Applicable to Text, Voice, Announcement, Stage, Forum, and Media channels.
     */
    parent_id?: string;
    /**
     * Channel voice region ID; automatically set when null.
     * Applicable to Voice and Stage channels.
     */
    rtc_region?: string;
    /**
     * The camera video quality mode of the voice channel.
     * Applicable to Voice and Stage channels.
     */
    video_quality_mode?: number;
    /**
     * The default duration that clients use (not the API) for newly created threads
     * in the channel, in minutes, to automatically archive the thread after recent activity.
     * Applicable to Text, Announcement, Forum, and Media channels.
     */
    default_auto_archive_duration?: number;
    /**
     * Channel flags combined as a bitfield.
     * Currently, only REQUIRE_TAG (1 << 4) is supported by GUILD_FORUM and GUILD_MEDIA channels.
     * HIDE_MEDIA_DOWNLOAD_OPTIONS (1 << 15) is supported only by GUILD_MEDIA channels.
     * Applicable to Forum and Media channels.
     */
    flags?: number;
    /**
     * The set of tags that can be used in a GUILD_FORUM or a GUILD_MEDIA channel; limited to 20.
     * Applicable to Forum and Media channels.
     */
    available_tags?: Array<APIGuildForumTag>;
    /**
     * The emoji to show in the add reaction button on a thread in a GUILD_FORUM or a GUILD_MEDIA channel.
     * Applicable to Forum and Media channels.
     */
    default_reaction_emoji?: APIGuildForumDefaultReactionEmoji;
    /**
     * The initial rate_limit_per_user to set on newly created threads in a channel.
     * This field is copied to the thread at creation time and does not live update.
     * Applicable to Text, Forum, and Media channels.
     */
    default_thread_rate_limit_per_user?: number;
    /**
     * The default sort order type used to order posts in GUILD_FORUM and GUILD_MEDIA channels.
     * Applicable to Forum and Media channels.
     */
    default_sort_order?: number;
    /**
     * The default forum layout type used to display posts in GUILD_FORUM channels.
     * Applicable to Forum channels.
     */
    default_forum_layout?: number;
  },
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
