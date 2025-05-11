import type {
  RESTGetAPICurrentUserApplicationRoleConnectionResult,
  RESTGetAPICurrentUserConnectionsResult,
  RESTGetAPICurrentUserGuildsQuery,
  RESTGetAPICurrentUserGuildsResult,
  RESTGetAPIUserResult,
  RESTPatchAPICurrentUserJSONBody,
  RESTPatchAPICurrentUserResult,
  RESTPostAPICurrentUserCreateDMChannelResult,
  RESTPutAPICurrentUserApplicationRoleConnectionJSONBody,
  RESTPutAPICurrentUserApplicationRoleConnectionResult,
  Snowflake,
} from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { botEnv, callDiscord } from "../../internal/utils.ts";

/**
 * Returns a user object for a given user ID.
 * @param user The user to fetch (defaults to self)
 */
export async function getUser(user?: Snowflake): Promise<RESTGetAPIUserResult> {
  const res = await callDiscord(Routes.user(user), {
    method: "GET",
  });

  return res.json();
}

/**
 * Modify the current user's account settings.
 * @param data The new user data
 */
export async function modifyUser(
  data: RESTPatchAPICurrentUserJSONBody,
): Promise<RESTPatchAPICurrentUserResult> {
  const res = await callDiscord(Routes.user(), {
    method: "PATCH",
    body: data,
  });

  return res.json();
}

/**
 * Returns a list of partial guild objects the current user is a member of.
 * @param options Optional parameters for the request
 */
export async function listGuilds(
  options?: RESTGetAPICurrentUserGuildsQuery,
): Promise<RESTGetAPICurrentUserGuildsResult> {
  const res = await callDiscord(Routes.userGuilds(), {
    method: "GET",
    params: options as Record<string, string>,
  });

  return res.json();
}

/**
 * Leave a guild.
 * @param guild The guild to leave
 */
export async function leaveGuild(
  guild: Snowflake,
): Promise<void> {
  await callDiscord(Routes.userGuild(guild), {
    method: "DELETE",
  });
}

/**
 * Create a new DM channel with a user.
 * @param user The recipient to open a DM channel with
 */
export async function createDM(
  user: Snowflake,
): Promise<RESTPostAPICurrentUserCreateDMChannelResult> {
  const res = await callDiscord(Routes.userChannels(), {
    method: "POST",
    body: {
      recipient_id: user,
    },
  });

  return res.json();
}

/**
 * Returns a list of connection objects.
 */
export async function listConnections(): Promise<
  RESTGetAPICurrentUserConnectionsResult
> {
  const res = await callDiscord(Routes.userConnections(), {
    method: "GET",
  });

  return res.json();
}

/**
 * Returns the application role connection for the user.
 */
export async function getRoleConnection(): Promise<
  RESTGetAPICurrentUserApplicationRoleConnectionResult
> {
  const res = await callDiscord(
    Routes.userApplicationRoleConnection(botEnv.DISCORD_APP_ID!),
    {
      method: "GET",
    },
  );

  return res.json();
}

/**
 * Updates and returns the application role connection for the user.
 * @param data The new role connection data
 */
export async function modifyRoleConnection(
  data: RESTPutAPICurrentUserApplicationRoleConnectionJSONBody,
): Promise<
  RESTPutAPICurrentUserApplicationRoleConnectionResult
> {
  const res = await callDiscord(
    Routes.userApplicationRoleConnection(botEnv.DISCORD_APP_ID!),
    {
      method: "PUT",
      body: data,
    },
  );

  return res.json();
}
