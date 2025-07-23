import type {
  RESTGetAPIGuildScheduledEventQuery,
  RESTGetAPIGuildScheduledEventResult,
  RESTGetAPIGuildScheduledEventsQuery,
  RESTGetAPIGuildScheduledEventsResult,
  RESTGetAPIGuildScheduledEventUsersQuery,
  RESTGetAPIGuildScheduledEventUsersResult,
  RESTPatchAPIGuildScheduledEventJSONBody,
  RESTPatchAPIGuildScheduledEventResult,
  RESTPostAPIGuildScheduledEventJSONBody,
  RESTPostAPIGuildScheduledEventResult,
  Snowflake,
} from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { callDiscord } from "../../utils/call-discord.ts";

/**
 * Returns a list of guild scheduled event objects for the given guild.
 * @param guild The guild to get the scheduled events from
 * @param options Optional parameters for the request
 */
export async function listScheduledEvents(
  guild: Snowflake,
  options?: RESTGetAPIGuildScheduledEventsQuery,
): Promise<RESTGetAPIGuildScheduledEventsResult> {
  const res = await callDiscord(Routes.guildScheduledEvents(guild), {
    method: "GET",
    params: options,
  });

  return res.json();
}

/**
 * Create a guild scheduled event in the guild.
 * @param guild The guild to create the scheduled event in
 * @param data The scheduled event data
 */
export async function createScheduledEvent(
  guild: Snowflake,
  data: RESTPostAPIGuildScheduledEventJSONBody,
): Promise<RESTPostAPIGuildScheduledEventResult> {
  const res = await callDiscord(Routes.guildScheduledEvents(guild), {
    method: "POST",
    body: data,
  });

  return res.json();
}

/**
 * Get a guild scheduled event.
 * @param guild The guild to get the scheduled event in
 * @param event The event to get
 * @param options Optional parameters for the request
 */
export async function getScheduledEvent(
  guild: Snowflake,
  event: Snowflake,
  options?: RESTGetAPIGuildScheduledEventQuery,
): Promise<RESTGetAPIGuildScheduledEventResult> {
  const res = await callDiscord(Routes.guildScheduledEvent(guild, event), {
    method: "GET",
    params: options,
  });

  return res.json();
}

/**
 * Modify a guild scheduled event.
 * @param guild The guild to modify the scheduled event in
 * @param event The event to modify
 * @param data The new scheduled event data
 */
export async function modifyScheduledEvent(
  guild: Snowflake,
  event: Snowflake,
  data: RESTPatchAPIGuildScheduledEventJSONBody,
): Promise<RESTPatchAPIGuildScheduledEventResult> {
  const res = await callDiscord(Routes.guildScheduledEvent(guild, event), {
    method: "PATCH",
    body: data,
  });

  return res.json();
}

/**
 * Delete a guild scheduled event.
 * @param guild The guild to delete the scheduled event from
 * @param event The event to delete
 */
export async function deleteScheduledEvent(
  guild: Snowflake,
  event: Snowflake,
): Promise<void> {
  await callDiscord(Routes.guildScheduledEvent(guild, event), {
    method: "DELETE",
  });
}

/**
 * Get a list of guild scheduled event users subscribed to a guild scheduled event.
 * @param guild The guild to get the scheduled event in
 * @param event The event to get from
 * @param options Optional parameters for the request
 */
export async function getScheduledEventUsers(
  guild: Snowflake,
  event: Snowflake,
  options?: RESTGetAPIGuildScheduledEventUsersQuery,
): Promise<RESTGetAPIGuildScheduledEventUsersResult> {
  const res = await callDiscord(Routes.guildScheduledEventUsers(guild, event), {
    method: "GET",
    params: options,
  });

  return res.json();
}
