import {
  type RESTGetAPIApplicationCommandPermissionsResult,
  type RESTGetAPIApplicationCommandResult,
  type RESTGetAPIApplicationCommandsQuery,
  type RESTGetAPIApplicationCommandsResult,
  type RESTGetAPIApplicationGuildCommandResult,
  type RESTGetAPIApplicationGuildCommandsQuery,
  type RESTGetAPIApplicationGuildCommandsResult,
  type RESTGetAPIApplicationRoleConnectionMetadataResult,
  type RESTGetAPIAuditLogQuery,
  type RESTGetAPIAuditLogResult,
  type RESTGetAPIAutoModerationRuleResult,
  type RESTGetAPIAutoModerationRulesResult,
  type RESTGetAPIGuildApplicationCommandsPermissionsResult,
  type RESTGetCurrentApplicationResult,
  type RESTPatchAPIApplicationCommandJSONBody,
  type RESTPatchAPIApplicationCommandResult,
  type RESTPatchAPIApplicationGuildCommandJSONBody,
  type RESTPatchAPIApplicationGuildCommandResult,
  type RESTPatchAPIAutoModerationRuleJSONBody,
  type RESTPatchAPIAutoModerationRuleResult,
  type RESTPatchCurrentApplicationJSONBody,
  type RESTPatchCurrentApplicationResult,
  type RESTPostAPIApplicationCommandsJSONBody,
  type RESTPostAPIApplicationCommandsResult,
  type RESTPostAPIApplicationGuildCommandsJSONBody,
  type RESTPostAPIApplicationGuildCommandsResult,
  type RESTPostAPIAutoModerationRuleJSONBody,
  type RESTPostAPIAutoModerationRuleResult,
  type RESTPutAPIApplicationCommandPermissionsJSONBody,
  type RESTPutAPIApplicationCommandPermissionsResult,
  type RESTPutAPIApplicationCommandsJSONBody,
  type RESTPutAPIApplicationCommandsResult,
  type RESTPutAPIApplicationGuildCommandsJSONBody,
  type RESTPutAPIApplicationGuildCommandsResult,
  type RESTPutAPIApplicationRoleConnectionMetadataResult,
  Routes,
  type Snowflake,
} from "discord-api-types/v10";
import { callDiscord } from "../utils/call-discord.ts";
import { botEnv } from "../utils/env.ts";

/**
 * Fetch all of the global commands for your application.
 * @warn The objects returned by this endpoint may be augmented with [additional fields if localization is active](https://discord.com/developers/docs/interactions/application-commands#retrieving-localized-commands).
 * @see https://discord.com/developers/docs/interactions/application-commands.mdx#get-global-application-commands
 */
export async function listGlobalCommands(
  params?: RESTGetAPIApplicationCommandsQuery,
): Promise<RESTGetAPIApplicationCommandsResult> {
  const res = await callDiscord(Routes.applicationCommands(botEnv.DISCORD_APP_ID), {
    method: "GET",
    params,
  });
  return res.json();
}

/**
 * Create a new global command.
 * @warn Creating a command with the same name as an existing command for your application will overwrite the old command.
 * @see https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
 */
export async function createGlobalCommand(
  data: RESTPostAPIApplicationCommandsJSONBody,
): Promise<RESTPostAPIApplicationCommandsResult> {
  const res = await callDiscord(Routes.applicationCommands(botEnv.DISCORD_APP_ID), {
    method: "POST",
    body: data,
  });
  return res.json();
}

/**
 * Fetch a global command for your application.
 * @see https://discord.com/developers/docs/interactions/application-commands#get-global-application-command
 */
export async function getGlobalCommand(commandId: Snowflake): Promise<RESTGetAPIApplicationCommandResult> {
  const res = await callDiscord(Routes.applicationCommand(botEnv.DISCORD_APP_ID, commandId), {
    method: "GET",
  });
  return res.json();
}

/**
 * Edit a global command.
 * @see https://discord.com/developers/docs/interactions/application-commands#edit-global-application-command
 */
export async function modifyGlobalCommand(
  commandId: Snowflake,
  data: RESTPatchAPIApplicationCommandJSONBody,
): Promise<RESTPatchAPIApplicationCommandResult> {
  const res = await callDiscord(Routes.applicationCommand(botEnv.DISCORD_APP_ID, commandId), {
    method: "PATCH",
    body: data,
  });
  return res.json();
}

/**
 * Deletes a global command.
 * @see https://discord.com/developers/docs/interactions/application-commands#delete-global-application-command
 */
export async function deleteGlobalCommand(commandId: Snowflake): Promise<void> {
  const _res = await callDiscord(Routes.applicationCommand(botEnv.DISCORD_APP_ID, commandId), {
    method: "DELETE",
  });
}

/**
 * Takes a list of application commands, overwriting the existing global command list for this application.
 * @danger This will overwrite all types of application commands: slash commands, user commands, and message commands.
 * @see https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
 */
export async function bulkOverwriteGlobalCommands(
  data: RESTPutAPIApplicationCommandsJSONBody,
): Promise<RESTPutAPIApplicationCommandsResult> {
  const res = await callDiscord(Routes.applicationCommands(botEnv.DISCORD_APP_ID), {
    method: "PUT",
    body: data,
  });
  return res.json();
}

/**
 * Fetch all of the guild commands for your application for a specific guild.
 * @warn The objects returned by this endpoint may be augmented with [additional fields if localization is active](https://discord.com/developers/docs/interactions/application-commands#retrieving-localized-commands).
 * @see https://discord.com/developers/docs/interactions/application-commands#get-guild-application-commands
 */
export async function listGuildCommands(
  guildId: Snowflake,
  params?: RESTGetAPIApplicationGuildCommandsQuery,
): Promise<RESTGetAPIApplicationGuildCommandsResult> {
  const res = await callDiscord(Routes.applicationGuildCommands(botEnv.DISCORD_APP_ID, guildId), {
    method: "GET",
    params,
  });
  return res.json();
}

/**
 * Create a new guild command. New guild commands will be available in the guild immediately.
 * @danger Creating a command with the same name as an existing command for your application will overwrite the old command.
 * @see https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command
 */
export async function createGuildCommand(
  guildId: Snowflake,
  data: RESTPostAPIApplicationGuildCommandsJSONBody,
): Promise<RESTPostAPIApplicationGuildCommandsResult> {
  const res = await callDiscord(Routes.applicationGuildCommands(botEnv.DISCORD_APP_ID, guildId), {
    method: "POST",
    body: data,
  });
  return res.json();
}

/**
 * Fetch a guild command for your application.
 * @see https://discord.com/developers/docs/interactions/application-commands#get-guild-application-command
 */
export async function getGuildCommand(
  guildId: Snowflake,
  commandId: Snowflake,
): Promise<RESTGetAPIApplicationGuildCommandResult> {
  const res = await callDiscord(Routes.applicationGuildCommand(botEnv.DISCORD_APP_ID, guildId, commandId), {
    method: "GET",
  });
  return res.json();
}

/**
 * Edit a guild command. Updates for guild commands will be available immediately.
 * @see https://discord.com/developers/docs/interactions/application-commands#edit-guild-application-command
 */
export async function modifyGuildCommand(
  guildId: Snowflake,
  commandId: Snowflake,
  data: RESTPatchAPIApplicationGuildCommandJSONBody,
): Promise<RESTPatchAPIApplicationGuildCommandResult> {
  const res = await callDiscord(Routes.applicationGuildCommand(botEnv.DISCORD_APP_ID, guildId, commandId), {
    method: "PATCH",
    body: data,
  });
  return res.json();
}

/**
 * Delete a guild command.
 * @see https://discord.com/developers/docs/interactions/application-commands#delete-guild-application-command
 */
export async function deleteGuildCommand(guildId: Snowflake, commandId: Snowflake): Promise<void> {
  const _res = await callDiscord(Routes.applicationGuildCommand(botEnv.DISCORD_APP_ID, guildId, commandId), {
    method: "DELETE",
  });
}

/**
 * Takes a list of application commands, overwriting the existing command list for this application for the targeted guild.
 * @danger This will overwrite **all** types of application commands: slash commands, user commands, and message commands.
 * @see https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-guild-application-commands
 */
export async function bulkOverwriteGuildCommands(
  guildId: Snowflake,
  data: RESTPutAPIApplicationGuildCommandsJSONBody,
): Promise<RESTPutAPIApplicationGuildCommandsResult> {
  const res = await callDiscord(Routes.applicationGuildCommands(botEnv.DISCORD_APP_ID, guildId), {
    method: "PUT",
    body: data,
  });
  return res.json();
}

/**
 * Fetches permissions for all commands for your application in a guild.
 * @see https://discord.com/developers/docs/interactions/application-commands#get-guild-application-command-permissions
 */
export async function listGuildCommandsPermissions(
  guildId: Snowflake,
): Promise<RESTGetAPIGuildApplicationCommandsPermissionsResult> {
  const res = await callDiscord(Routes.guildApplicationCommandsPermissions(botEnv.DISCORD_APP_ID, guildId), {
    method: "GET",
  });
  return res.json();
}

/**
 * Fetches permissions for a specific command for your application in a guild.
 * @see https://discord.com/developers/docs/interactions/application-commands#get-application-command-permissions
 */
export async function getGuildCommandPermissions(
  guildId: Snowflake,
  commandId: Snowflake,
): Promise<RESTGetAPIApplicationCommandPermissionsResult> {
  const res = await callDiscord(Routes.applicationCommandPermissions(botEnv.DISCORD_APP_ID, guildId, commandId), {
    method: "GET",
  });
  return res.json();
}

/**
 * Edits command permissions for a specific command for your application in a guild.
 * @warn This endpoint will overwrite existing permissions for the command in that guild
 * @warn Deleting or renaming a command will permanently delete all permissions for the command
 * @see https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions
 */
export async function modifyGuildCommandPermissions(
  guildId: Snowflake,
  commandId: Snowflake,
  data: RESTPutAPIApplicationCommandPermissionsJSONBody,
): Promise<RESTPutAPIApplicationCommandPermissionsResult> {
  const res = await callDiscord(Routes.applicationCommandPermissions(botEnv.DISCORD_APP_ID, guildId, commandId), {
    method: "PUT",
    body: data,
  });
  return res.json();
}

/**
 * Returns a list of [application role connection metadata](https://discord.com/developers/docs/resources/application-role-connection-metadata#application-role-connection-metadata-object) objects for the given application.
 * @see https://discord.com/developers/docs/resources/application-role-connection-metadata#get-application-role-connection-metadata-records
 */
export async function listAppRoleConnectionMetadata(): Promise<RESTGetAPIApplicationRoleConnectionMetadataResult> {
  const res = await callDiscord(Routes.applicationRoleConnectionMetadata(botEnv.DISCORD_APP_ID), {
    method: "GET",
  });
  return res.json();
}

/**
 * Updates and returns a list of [application role connection metadata](https://discord.com/developers/docs/resources/application-role-connection-metadata#application-role-connection-metadata-object) objects for the given application.
 * @info An application can have a maximum of 5 metadata records.
 * @see https://discord.com/developers/docs/resources/application-role-connection-metadata#update-application-role-connection-metadata-records
 */
export async function modifyAppRoleConnectionMetadata(): Promise<RESTPutAPIApplicationRoleConnectionMetadataResult> {
  const res = await callDiscord(Routes.applicationRoleConnectionMetadata(botEnv.DISCORD_APP_ID), {
    method: "PUT",
  });
  return res.json();
}

/**
 * Returns the [application](https://discord.com/developers/docs/resources/application#application-object) object associated with the requesting bot user.
 * @see https://discord.com/developers/docs/resources/application#get-current-application
 */
export async function getApp(): Promise<RESTGetCurrentApplicationResult> {
  const res = await callDiscord(Routes.currentApplication(), {
    method: "GET",
  });
  return res.json();
}

/**
 * Edit properties of the app associated with the requesting bot user. Only properties that are passed will be updated.
 * @see https://discord.com/developers/docs/resources/application#edit-current-application
 */
export async function modifyApp(data: RESTPatchCurrentApplicationJSONBody): Promise<RESTPatchCurrentApplicationResult> {
  const res = await callDiscord(Routes.currentApplication(), {
    method: "PATCH",
    body: data,
  });
  return res.json();
}

/**
 * Returns an [audit log](https://discord.com/developers/docs/resources/audit-log#audit-log-object) object for the guild.
 * @see https://discord.com/developers/docs/resources/audit-log#get-guild-audit-log
 */
export async function getAuditLog(
  guildId: Snowflake,
  params?: RESTGetAPIAuditLogQuery,
): Promise<RESTGetAPIAuditLogResult> {
  const res = await callDiscord(Routes.guildAuditLog(guildId), {
    method: "GET",
    params,
  });
  return res.json();
}

/**
 * Get a list of all rules currently configured for the guild.
 * @info This endpoint requires the `MANAGE_GUILD` [permission](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-permission-requirements).
 * @see https://discord.com/developers/docs/resources/auto-moderation#list-auto-moderation-rules-for-guild
 */
export async function listAutomodRules(guildId: Snowflake): Promise<RESTGetAPIAutoModerationRulesResult> {
  const res = await callDiscord(Routes.guildAutoModerationRules(guildId), {
    method: "GET",
  });
  return res.json();
}

/**
 * Get a single rule.
 * @info This endpoint requires the `MANAGE_GUILD` [permission](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-permission-requirements).
 * @see https://discord.com/developers/docs/resources/auto-moderation#get-auto-moderation-rule
 */
export async function getAutomodRule(
  guildId: Snowflake,
  ruleId: Snowflake,
): Promise<RESTGetAPIAutoModerationRuleResult> {
  const res = await callDiscord(Routes.guildAutoModerationRule(guildId, ruleId), {
    method: "GET",
  });
  return res.json();
}

/**
 * Create a new rule.
 * @info This endpoint requires the `MANAGE_GUILD` [permission](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-permission-requirements).
 * @see https://discord.com/developers/docs/resources/auto-moderation#create-auto-moderation-rule
 */
export async function createAutomodRule(
  guildId: Snowflake,
  data: RESTPostAPIAutoModerationRuleJSONBody,
): Promise<RESTPostAPIAutoModerationRuleResult> {
  const res = await callDiscord(Routes.guildAutoModerationRules(guildId), {
    method: "POST",
    body: data,
  });
  return res.json();
}

/**
 * Modify an existing rule.
 * @info This endpoint requires the `MANAGE_GUILD` [permission](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-permission-requirements).
 * @see https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule
 */
export async function modifyAutomodRule(
  guildId: Snowflake,
  ruleId: Snowflake,
  data: RESTPatchAPIAutoModerationRuleJSONBody,
): Promise<RESTPatchAPIAutoModerationRuleResult> {
  const res = await callDiscord(Routes.guildAutoModerationRule(guildId, ruleId), {
    method: "PATCH",
    body: data,
  });
  return res.json();
}

/**
 * Delete a rule.
 * @info This endpoint requires the `MANAGE_GUILD` [permission](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-permission-requirements).
 * @see https://discord.com/developers/docs/resources/auto-moderation#delete-auto-moderation-rule
 */
export async function deleteAutomodRule(guildId: Snowflake, ruleId: Snowflake): Promise<void> {
  const _res = await callDiscord(Routes.guildAutoModerationRule(guildId, ruleId), {
    method: "DELETE",
  });
}
