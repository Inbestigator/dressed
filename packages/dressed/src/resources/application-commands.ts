import type {
  RESTGetAPIApplicationCommandsResult,
  RESTGetAPIApplicationCommandsQuery,
  RESTPostAPIApplicationCommandsJSONBody,
  RESTPostAPIApplicationCommandsResult,
  Snowflake,
  RESTGetAPIApplicationCommandResult,
  RESTPatchAPIApplicationCommandJSONBody,
  RESTPatchAPIApplicationCommandResult,
  RESTPutAPIApplicationCommandsJSONBody,
  RESTPutAPIApplicationCommandsResult,
  RESTGetAPIApplicationGuildCommandsResult,
  RESTGetAPIApplicationGuildCommandsQuery,
  RESTPostAPIApplicationGuildCommandsJSONBody,
  RESTPostAPIApplicationGuildCommandsResult,
  RESTGetAPIApplicationGuildCommandResult,
  RESTPatchAPIApplicationGuildCommandResult,
  RESTPatchAPIApplicationGuildCommandJSONBody,
  RESTPutAPIApplicationGuildCommandsResult,
  RESTPutAPIApplicationGuildCommandsJSONBody,
  RESTGetAPIGuildApplicationCommandsPermissionsResult,
  RESTGetAPIApplicationCommandPermissionsResult,
  RESTPutAPIApplicationCommandPermissionsJSONBody,
} from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { callDiscord } from "../utils/call-discord.ts";
import { botEnv } from "../utils/env.ts";

/**
 * Fetch all of the global commands for your application.
 * @param options Optional parameters for the request
 */
export async function listGlobalCommands(
  options?: RESTGetAPIApplicationCommandsQuery,
): Promise<RESTGetAPIApplicationCommandsResult> {
  const res = await callDiscord(
    Routes.applicationCommands(botEnv.DISCORD_APP_ID),
    {
      method: "GET",
      params: options,
    },
  );

  return res.json();
}

/**
 * Create a new global command.
 * @param data The command data
 */
export async function createGlobalCommand(
  data: RESTPostAPIApplicationCommandsJSONBody,
): Promise<RESTPostAPIApplicationCommandsResult> {
  const res = await callDiscord(
    Routes.applicationCommands(botEnv.DISCORD_APP_ID),
    {
      method: "POST",
      body: data,
    },
  );

  return res.json();
}

/**
 * Fetch a global command for your application.
 * @param command The command to get
 */
export async function getGlobalCommand(
  command: Snowflake,
): Promise<RESTGetAPIApplicationCommandResult> {
  const res = await callDiscord(
    Routes.applicationCommand(botEnv.DISCORD_APP_ID, command),
    {
      method: "GET",
    },
  );

  return res.json();
}

/**
 * Edit a global command.
 * @param command The command to edit
 * @param data The new command data
 */
export async function modifyGlobalCommand(
  command: Snowflake,
  data: RESTPatchAPIApplicationCommandJSONBody,
): Promise<RESTPatchAPIApplicationCommandResult> {
  const res = await callDiscord(
    Routes.applicationCommand(botEnv.DISCORD_APP_ID, command),
    {
      method: "PATCH",
      body: data,
    },
  );

  return res.json();
}

/**
 * Deletes a global command.
 * @param command The command to delete
 */
export async function deleteGlobalCommand(command: Snowflake): Promise<void> {
  const res = await callDiscord(
    Routes.applicationCommand(botEnv.DISCORD_APP_ID, command),
    {
      method: "DELETE",
    },
  );

  return res.json();
}

/**
 * Takes a list of application commands, overwriting the existing global command list for this application.
 * @param data The commands to use
 */
export async function bulkOverwriteGlobalCommands(
  data: RESTPutAPIApplicationCommandsJSONBody,
): Promise<RESTPutAPIApplicationCommandsResult> {
  const res = await callDiscord(
    Routes.applicationCommands(botEnv.DISCORD_APP_ID),
    {
      method: "PUT",
      body: data,
    },
  );

  return res.json();
}

/**
 * Fetch all of the guild commands for your application for a specific guild.
 * @param guild The commands to fetch from
 * @param options Optional parameters for the request
 */
export async function listGuildCommands(
  guild: Snowflake,
  options?: RESTGetAPIApplicationGuildCommandsQuery,
): Promise<RESTGetAPIApplicationGuildCommandsResult> {
  const res = await callDiscord(
    Routes.applicationGuildCommands(botEnv.DISCORD_APP_ID, guild),
    {
      method: "GET",
      params: options,
    },
  );

  return res.json();
}

/**
 * Create a guild global command.
 * @param guild The guild to create the command in
 * @param data The command data
 */
export async function createGuildCommand(
  guild: Snowflake,
  data: RESTPostAPIApplicationGuildCommandsJSONBody,
): Promise<RESTPostAPIApplicationGuildCommandsResult> {
  const res = await callDiscord(
    Routes.applicationGuildCommands(botEnv.DISCORD_APP_ID, guild),
    {
      method: "POST",
      body: data,
    },
  );

  return res.json();
}

/**
 * Fetch a guild command for your application.
 * @param guild The guild to get the command from
 * @param command The command to get
 */
export async function getGuildCommand(
  guild: Snowflake,
  command: Snowflake,
): Promise<RESTGetAPIApplicationGuildCommandResult> {
  const res = await callDiscord(
    Routes.applicationGuildCommand(botEnv.DISCORD_APP_ID, guild, command),
    {
      method: "GET",
    },
  );

  return res.json();
}

/**
 * Edit a guild command.
 * @param guild The guild to edit the command in
 * @param command The command to edit
 * @param data The new command data
 */
export async function modifyGuildCommand(
  guild: Snowflake,
  command: Snowflake,
  data: RESTPatchAPIApplicationGuildCommandJSONBody,
): Promise<RESTPatchAPIApplicationGuildCommandResult> {
  const res = await callDiscord(
    Routes.applicationGuildCommand(botEnv.DISCORD_APP_ID, guild, command),
    {
      method: "PATCH",
      body: data,
    },
  );

  return res.json();
}

/**
 * Deletes a guild command.
 * @param guild The guild to delete the command from
 * @param command The command to delete
 */
export async function deleteGuildCommand(
  guild: Snowflake,
  command: Snowflake,
): Promise<void> {
  const res = await callDiscord(
    Routes.applicationGuildCommand(botEnv.DISCORD_APP_ID, guild, command),
    {
      method: "DELETE",
    },
  );

  return res.json();
}

/**
 * Takes a list of application commands, overwriting the existing command list for this application for the targeted guild.
 * @param guild The guild to overwrite in
 * @param data The commands to use
 */
export async function bulkOverwriteGuildCommands(
  guild: Snowflake,
  data: RESTPutAPIApplicationGuildCommandsJSONBody,
): Promise<RESTPutAPIApplicationGuildCommandsResult> {
  const res = await callDiscord(
    Routes.applicationGuildCommands(botEnv.DISCORD_APP_ID, guild),
    {
      method: "PUT",
      body: data,
    },
  );

  return res.json();
}

/**
 * Fetches permissions for all commands for your application in a guild.
 * @param guild The guild to fetch from
 */
export async function listGuildCommandsPermissions(
  guild: Snowflake,
): Promise<RESTGetAPIGuildApplicationCommandsPermissionsResult> {
  const res = await callDiscord(
    Routes.guildApplicationCommandsPermissions(botEnv.DISCORD_APP_ID, guild),
    {
      method: "GET",
    },
  );

  return res.json();
}

/**
 * Fetches permissions for a specific command for your application in a guild.
 * @param guild The guild to fetch from
 * @param command The command to fetch
 */
export async function getGuildCommandPermissions(
  guild: Snowflake,
  command: Snowflake,
): Promise<RESTGetAPIApplicationCommandPermissionsResult> {
  const res = await callDiscord(
    Routes.applicationCommandPermissions(botEnv.DISCORD_APP_ID, guild, command),
    {
      method: "GET",
    },
  );

  return res.json();
}

/**
 * Edits command permissions for a specific command for your application in a guild.
 * @param guild The guild to edit in
 * @param command The command to edit
 * @param data The new permissions for the command
 */
export async function modifyGuildCommandPermissions(
  guild: Snowflake,
  command: Snowflake,
  data: RESTPutAPIApplicationCommandPermissionsJSONBody,
): Promise<RESTGetAPIApplicationCommandPermissionsResult> {
  const res = await callDiscord(
    Routes.applicationCommandPermissions(botEnv.DISCORD_APP_ID, guild, command),
    {
      method: "PUT",
      body: data,
    },
  );

  return res.json();
}
