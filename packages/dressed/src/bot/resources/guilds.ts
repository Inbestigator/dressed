import type {
  RESTGetAPIGuildBanResult,
  RESTGetAPIGuildBansQuery,
  RESTGetAPIGuildBansResult,
  RESTGetAPIGuildChannelsResult,
  RESTGetAPIGuildIntegrationsResult,
  RESTGetAPIGuildInvitesResult,
  RESTGetAPIGuildMemberResult,
  RESTGetAPIGuildMembersQuery,
  RESTGetAPIGuildMembersResult,
  RESTGetAPIGuildMembersSearchQuery,
  RESTGetAPIGuildMembersSearchResult,
  RESTGetAPIGuildOnboardingResult,
  RESTGetAPIGuildPreviewResult,
  RESTGetAPIGuildPruneCountQuery,
  RESTGetAPIGuildPruneCountResult,
  RESTGetAPIGuildQuery,
  RESTGetAPIGuildResult,
  RESTGetAPIGuildRoleResult,
  RESTGetAPIGuildRolesResult,
  RESTGetAPIGuildThreadsResult,
  RESTGetAPIGuildVanityUrlResult,
  RESTGetAPIGuildWelcomeScreenResult,
  RESTGetAPIGuildWidgetImageQuery,
  RESTGetAPIGuildWidgetImageResult,
  RESTGetAPIGuildWidgetJSONResult,
  RESTGetAPIGuildWidgetSettingsResult,
  RESTGetAPIVoiceRegionsResult,
  RESTPatchAPIGuildChannelPositionsJSONBody,
  RESTPatchAPIGuildJSONBody,
  RESTPatchAPIGuildMemberJSONBody,
  RESTPatchAPIGuildMemberResult,
  RESTPatchAPIGuildResult,
  RESTPatchAPIGuildRoleJSONBody,
  RESTPatchAPIGuildRolePositionsJSONBody,
  RESTPatchAPIGuildRolePositionsResult,
  RESTPatchAPIGuildRoleResult,
  RESTPatchAPIGuildWelcomeScreenJSONBody,
  RESTPatchAPIGuildWelcomeScreenResult,
  RESTPatchAPIGuildWidgetSettingsJSONBody,
  RESTPatchAPIGuildWidgetSettingsResult,
  RESTPostAPIGuildBulkBanJSONBody,
  RESTPostAPIGuildBulkBanResult,
  RESTPostAPIGuildChannelJSONBody,
  RESTPostAPIGuildChannelResult,
  RESTPostAPIGuildPruneJSONBody,
  RESTPostAPIGuildPruneResult,
  RESTPostAPIGuildRoleJSONBody,
  RESTPostAPIGuildRoleResult,
  RESTPostAPIGuildsJSONBody,
  RESTPostAPIGuildsMFAJSONBody,
  RESTPostAPIGuildsMFAResult,
  RESTPostAPIGuildsResult,
  RESTPutAPIGuildBanJSONBody,
  RESTPutAPIGuildMemberJSONBody,
  RESTPutAPIGuildMemberResult,
  RESTPutAPIGuildOnboardingJSONBody,
  RESTPutAPIGuildOnboardingResult,
  Snowflake,
} from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { callDiscord } from "../../utils/call-discord.ts";

/**
 * @deprecated Discord is removing the ability for applications to create guilds after 2025-07-15
 *
 * Create a new guild.
 * @param guild The guild data
 */
export async function createGuild(
  data: RESTPostAPIGuildsJSONBody,
): Promise<RESTPostAPIGuildsResult> {
  const res = await callDiscord(Routes.guilds(), {
    method: "POST",
    body: data,
  });

  return res.json();
}

/**
 * Get a guild by ID.
 * @param guild The guild to fetch
 * @param options Optional parameters for the request
 */
export async function getGuild(
  guild: Snowflake,
  options?: RESTGetAPIGuildQuery,
): Promise<RESTGetAPIGuildResult> {
  const res = await callDiscord(Routes.guild(guild), {
    method: "GET",
    params: options as Record<string, unknown>,
  });

  return res.json();
}

/**
 * Returns the guild preview object for the given id.
 * @param guild The guild to fetch
 */
export async function getGuildPreview(
  guild: Snowflake,
): Promise<RESTGetAPIGuildPreviewResult> {
  const res = await callDiscord(Routes.guildPreview(guild), {
    method: "GET",
  });

  return res.json();
}

/**
 * Modify a guild's settings.
 * @param guild The guild to modify
 * @param data The new data for the guild
 */
export async function modifyGuild(
  guild: Snowflake,
  data: RESTPatchAPIGuildJSONBody,
): Promise<RESTPatchAPIGuildResult> {
  const res = await callDiscord(Routes.guild(guild), {
    method: "PATCH",
    body: data,
  });

  return res.json();
}

/**
 * Delete a guild permanently. User must be owner.
 * @param guild The guild to delete
 */
export async function deleteGuild(guild: Snowflake): Promise<void> {
  await callDiscord(Routes.guild(guild), {
    method: "DELETE",
  });
}

/**
 * Get a list of channels in a guild, does not include threads
 * @param guild The guild to get the channels from
 */
export async function listChannels(
  guild: Snowflake,
): Promise<RESTGetAPIGuildChannelsResult> {
  const res = await callDiscord(Routes.guildChannels(guild), {
    method: "GET",
  });

  return res.json();
}

/**
 * Create a new channel.
 * @param guild The guild to create the channels in
 * @param data The data for the new channel
 */
export async function createChannel(
  guild: Snowflake,
  data: RESTPostAPIGuildChannelJSONBody,
): Promise<RESTPostAPIGuildChannelResult> {
  const res = await callDiscord(Routes.guildChannels(guild), {
    method: "POST",
    body: data,
  });

  return res.json();
}

/**
 * Modify the positions of a set of channel objects for the guild.
 * @param guild The guild to modify the channels in
 * @param data The new positions for the channels
 */
export async function modifyChannelPositions(
  guild: Snowflake,
  data: RESTPatchAPIGuildChannelPositionsJSONBody,
): Promise<void> {
  await callDiscord(Routes.guildChannels(guild), {
    method: "PATCH",
    body: data,
  });
}

/**
 * Returns all active threads in the guild, including public and private threads.
 * @param guild The guild to get the active threads from
 */
export async function listActiveThreads(
  guild: Snowflake,
): Promise<RESTGetAPIGuildThreadsResult> {
  const res = await callDiscord(Routes.guildActiveThreads(guild), {
    method: "GET",
  });

  return res.json();
}

/**
 * Get a specific member from a guild
 * @param guild The guild to get the member from
 * @param member The member to get (defaults to self)
 */
export async function getMember(
  guild: Snowflake,
  member?: Snowflake,
): Promise<RESTGetAPIGuildMemberResult> {
  const res = await callDiscord(
    member ? Routes.guildMember(guild, member) : Routes.userGuildMember(guild),
    {
      method: "GET",
    },
  );

  return res.json();
}

/**
 * Get a list of members in a guild
 * @param guild The guild to get the members from
 * @param options Optional parameters for the request
 */
export async function listMembers(
  guild: Snowflake,
  options?: RESTGetAPIGuildMembersQuery,
): Promise<RESTGetAPIGuildMembersResult> {
  const res = await callDiscord(Routes.guildMembers(guild), {
    method: "GET",
    params: options as Record<string, unknown>,
  });

  return res.json();
}

/**
 * Returns a list of guild member objects whose username or nickname starts with a provided string.
 * @param guild The guild to get the members from
 * @param options Parameters for the request
 */
export async function searchMembers(
  guild: Snowflake,
  options: RESTGetAPIGuildMembersSearchQuery,
): Promise<RESTGetAPIGuildMembersSearchResult> {
  const res = await callDiscord(Routes.guildMembersSearch(guild), {
    method: "GET",
    params: options as unknown as Record<string, unknown>,
  });

  return res.json();
}

/**
 * Adds a user to the guild, provided you have a valid oauth2 access token for the user with the guilds.join scope.
 * @param guild The guild to add the member to
 * @param user The user to add
 * @param data The data for the new member
 */
export async function addMember(
  guild: Snowflake,
  user: Snowflake,
  data: RESTPutAPIGuildMemberJSONBody,
): Promise<RESTPutAPIGuildMemberResult> {
  const res = await callDiscord(Routes.guildMember(guild, user), {
    method: "PUT",
    body: data,
  });

  return res.json();
}

/**
 * Modify attributes of a guild member.
 * @param guild The guild to modify the member in
 * @param data The data for the new member
 * @param member The member to modify (defaults to self)
 */
export async function modifyMember(
  guild: Snowflake,
  data: RESTPatchAPIGuildMemberJSONBody,
  member?: Snowflake,
): Promise<RESTPatchAPIGuildMemberResult> {
  const res = await callDiscord(Routes.guildMember(guild, member), {
    method: "PATCH",
    body: data,
  });

  return res.json();
}

/**
 * Adds a role to a guild member.
 * @param guild The guild to add the role in
 * @param member The member to give the role to
 * @param role The role to give
 */
export async function addMemberRole(
  guild: Snowflake,
  member: Snowflake,
  role: Snowflake,
): Promise<void> {
  await callDiscord(Routes.guildMemberRole(guild, member, role), {
    method: "PUT",
  });
}

/**
 * Removes a role from a guild member.
 * @param guild The guild to remove the role in
 * @param member The member to remove the role from
 * @param role The role to remove
 */
export async function removeMemberRole(
  guild: Snowflake,
  member: Snowflake,
  role: Snowflake,
): Promise<void> {
  await callDiscord(Routes.guildMemberRole(guild, member, role), {
    method: "DELETE",
  });
}

/**
 * Remove a member from a guild.
 * @param guild The guild to remove the member from
 * @param member The member to remove
 */
export async function removeMember(
  guild: Snowflake,
  member: Snowflake,
): Promise<void> {
  await callDiscord(Routes.guildMember(guild, member), {
    method: "DELETE",
  });
}

/**
 * Returns a list of ban objects for the users banned from this guild.
 * @param guild The guild to get the bans from
 * @param options Optional parameters for the request
 */
export async function listBans(
  guild: Snowflake,
  options?: RESTGetAPIGuildBansQuery,
): Promise<RESTGetAPIGuildBansResult> {
  const res = await callDiscord(Routes.guildBans(guild), {
    method: "GET",
    params: options as Record<string, unknown>,
  });

  return res.json();
}

/**
 * Returns a ban object for the given user.
 * @param guild The guild to get the ban from
 * @param user The user to get the ban for
 */
export async function getBan(
  guild: Snowflake,
  user: Snowflake,
): Promise<RESTGetAPIGuildBanResult> {
  const res = await callDiscord(Routes.guildBan(guild, user), {
    method: "GET",
  });

  return res.json();
}

/**
 * Create a guild ban, and optionally delete previous messages sent by the banned user.
 * @param guild The guild to ban from
 * @param user The user to ban
 * @param data The data for the ban
 */
export async function createBan(
  guild: Snowflake,
  user: Snowflake,
  data: RESTPutAPIGuildBanJSONBody,
): Promise<void> {
  await callDiscord(Routes.guildBan(guild, user), {
    method: "PUT",
    body: data,
  });
}

/**
 * Remove the ban for a user.
 * @param guild The guild to ban from
 * @param user The user to ban
 */
export async function deleteBan(
  guild: Snowflake,
  user: Snowflake,
): Promise<void> {
  await callDiscord(Routes.guildBan(guild, user), {
    method: "DELETE",
  });
}

/**
 * Ban up to 200 users from a guild, and optionally delete previous messages sent by the banned users.
 * @param guild The guild to ban from
 * @param data The data for the bans
 */
export async function bulkCreateBan(
  guild: Snowflake,
  data: RESTPostAPIGuildBulkBanJSONBody,
): Promise<RESTPostAPIGuildBulkBanResult> {
  const res = await callDiscord(Routes.guildBulkBan(guild), {
    method: "POST",
    body: data,
  });

  return res.json();
}

/**
 * Get a list of roles in a guild
 * @param guild The guild to get the roles from
 */
export async function listRoles(
  guild: Snowflake,
): Promise<RESTGetAPIGuildRolesResult> {
  const res = await callDiscord(Routes.guildRoles(guild), {
    method: "GET",
  });

  return res.json();
}

/**
 * Get a role from a guild
 * @param guild The guild to get the role from
 * @param role The role to get
 */
export async function getRole(
  guild: Snowflake,
  role: Snowflake,
): Promise<RESTGetAPIGuildRoleResult> {
  const res = await callDiscord(Routes.guildRole(guild, role), {
    method: "GET",
  });

  return res.json();
}

/**
 * Create a new role for the guild.
 * @param guild The guild to create the role in
 * @param data The data for the new role
 */
export async function createRole(
  guild: Snowflake,
  data: RESTPostAPIGuildRoleJSONBody,
): Promise<RESTPostAPIGuildRoleResult> {
  const res = await callDiscord(Routes.guildRoles(guild), {
    method: "POST",
    body: data,
  });

  return res.json();
}

/**
 * Modify the positions of a set of role objects for the guild.
 * @param guild The guild to modify the roles in
 * @param data The new positions for the roles
 */
export async function modifyRolePositions(
  guild: Snowflake,
  data: RESTPatchAPIGuildRolePositionsJSONBody,
): Promise<RESTPatchAPIGuildRolePositionsResult> {
  const res = await callDiscord(Routes.guildRoles(guild), {
    method: "PATCH",
    body: data,
  });

  return res.json();
}

/**
 * Create a new role for the guild.
 * @param guild The guild to modify the role in
 * @param role The role to modify
 * @param data The new data for the role
 */
export async function modifyRole(
  guild: Snowflake,
  role: Snowflake,
  data: RESTPatchAPIGuildRoleJSONBody,
): Promise<RESTPatchAPIGuildRoleResult> {
  const res = await callDiscord(Routes.guildRole(guild, role), {
    method: "PATCH",
    body: data,
  });

  return res.json();
}

/**
 * Modify a guild's MFA level. Requires guild ownership.
 * @param guild The guild to modify the MFA for
 */
export async function modifyMFALevel(
  guild: Snowflake,
  data: RESTPostAPIGuildsMFAJSONBody,
): Promise<RESTPostAPIGuildsMFAResult> {
  const res = await callDiscord(Routes.guildMFA(guild), {
    method: "POST",
    body: data,
  });

  return res.json();
}

/**
 * Delete a guild role.
 * @param guild The guild to delete the role from
 * @param role The role to delete
 */
export async function deleteRole(
  guild: Snowflake,
  role: Snowflake,
): Promise<void> {
  await callDiscord(Routes.guildRole(guild, role), {
    method: "DELETE",
  });
}

/**
 * Returns an object with one pruned key indicating the number of members that would be removed in a prune operation.
 * @param guild The guild to get the prune count for
 * @param options Optional parameters for the request
 */
export async function getPruneCount(
  guild: Snowflake,
  options?: RESTGetAPIGuildPruneCountQuery,
): Promise<RESTGetAPIGuildPruneCountResult> {
  const res = await callDiscord(Routes.guildPrune(guild), {
    method: "GET",
    params: options as Record<string, unknown>,
  });

  return res.json();
}

/**
 * Begin a prune operation.
 * @param guild The guild to get the prune count for
 * @param data The data for the prune operation
 */
export async function startPrune(
  guild: Snowflake,
  data: RESTPostAPIGuildPruneJSONBody,
): Promise<RESTPostAPIGuildPruneResult> {
  const res = await callDiscord(Routes.guildPrune(guild), {
    method: "POST",
    body: data,
  });

  return res.json();
}

/**
 * Returns a list of voice region objects for the guild.
 * @param guild The guild to get the voice regions for
 */
export async function listVoiceRegions(
  guild: Snowflake,
): Promise<RESTGetAPIVoiceRegionsResult> {
  const res = await callDiscord(Routes.guildVoiceRegions(guild), {
    method: "GET",
  });

  return res.json();
}

/**
 * Returns a list of invite objects (with invite metadata) for the guild.
 * @param guild The guild to get the invites for
 */
export async function listInvites(
  guild: Snowflake,
): Promise<RESTGetAPIGuildInvitesResult> {
  const res = await callDiscord(Routes.guildInvites(guild), {
    method: "GET",
  });

  return res.json();
}

/**
 * Returns a list of integration objects for the guild.
 * @param guild The guild to get the integrations for
 */
export async function listIntegrations(
  guild: Snowflake,
): Promise<RESTGetAPIGuildIntegrationsResult> {
  const res = await callDiscord(Routes.guildIntegrations(guild), {
    method: "GET",
  });

  return res.json();
}

/**
 * Delete the attached integration object for the guild. Deletes any associated webhooks and kicks the associated bot if there is one.
 * @param guild The guild to delete the integration from
 * @param integration The integration to delete
 */
export async function deleteIntegration(
  guild: Snowflake,
  integration: Snowflake,
): Promise<void> {
  await callDiscord(Routes.guildIntegration(guild, integration), {
    method: "DELETE",
  });
}

/**
 * Returns a guild widget settings object.
 * @param guild The guild to get the widget settings from
 */
export async function getWidgetSettings(
  guild: Snowflake,
): Promise<RESTGetAPIGuildWidgetSettingsResult> {
  const res = await callDiscord(Routes.guildWidgetSettings(guild), {
    method: "GET",
  });

  return res.json();
}

/**
 * Modify a guild widget settings object for the guild.
 * @param guild The guild to modify the widget settings for
 * @param data The new data for the widget settings
 */
export async function modifyWidgetSettinga(
  guild: Snowflake,
  data: RESTPatchAPIGuildWidgetSettingsJSONBody,
): Promise<RESTPatchAPIGuildWidgetSettingsResult> {
  const res = await callDiscord(Routes.guildWidgetSettings(guild), {
    method: "PATCH",
    body: data,
  });

  return res.json();
}

/**
 * Returns the widget for the guild.
 * @param guild The guild to get the widget from
 */
export async function getWidgetJSON(
  guild: Snowflake,
): Promise<RESTGetAPIGuildWidgetJSONResult> {
  const res = await callDiscord(Routes.guildWidgetJSON(guild), {
    method: "GET",
  });

  return res.json();
}

/**
 * Returns a partial invite object for guilds with that feature enabled.
 * @param guild The guild to get the invite from
 */
export async function getVanityInvite(
  guild: Snowflake,
): Promise<RESTGetAPIGuildVanityUrlResult> {
  const res = await callDiscord(Routes.guildVanityUrl(guild), {
    method: "GET",
  });

  return res.json();
}

/**
 * Returns a PNG image widget for the guild.
 * @param guild The guild to get the widget from
 * @param options Optional parameters for the request
 */
export async function getWidgetImage(
  guild: Snowflake,
  options?: RESTGetAPIGuildWidgetImageQuery,
): Promise<RESTGetAPIGuildWidgetImageResult> {
  const res = await callDiscord(Routes.guildWidgetImage(guild), {
    method: "GET",
    params: options as Record<string, unknown>,
  });

  return res.json();
}

/**
 * Returns the Welcome Screen object for the guild.
 * @param guild The guild to get the welcome screen from
 */
export async function getWelcomeScreen(
  guild: Snowflake,
): Promise<RESTGetAPIGuildWelcomeScreenResult> {
  const res = await callDiscord(Routes.guildWelcomeScreen(guild), {
    method: "GET",
  });

  return res.json();
}

/**
 * Modify the guild's Welcome Screen.
 * @param guild The guild to modify the welcome screen for
 * @param data The new data for the welcome screen
 */
export async function modifyWelcomeScreen(
  guild: Snowflake,
  data: RESTPatchAPIGuildWelcomeScreenJSONBody,
): Promise<RESTPatchAPIGuildWelcomeScreenResult> {
  const res = await callDiscord(Routes.guildWelcomeScreen(guild), {
    method: "PATCH",
    body: data,
  });

  return res.json();
}

/**
 * Returns the Onboarding object for the guild.
 * @param guild The guild to get the onboarding from
 */
export async function getOnboarding(
  guild: Snowflake,
): Promise<RESTGetAPIGuildOnboardingResult> {
  const res = await callDiscord(Routes.guildOnboarding(guild), {
    method: "GET",
  });

  return res.json();
}

/**
 * Modifies the onboarding configuration of the guild.
 * @param guild The guild to modify the onboarding for
 * @param data The new data for the onboarding
 */
export async function modifyOnboarding(
  guild: Snowflake,
  data: RESTPutAPIGuildOnboardingJSONBody,
): Promise<RESTPutAPIGuildOnboardingResult> {
  const res = await callDiscord(Routes.guildOnboarding(guild), {
    method: "PATCH",
    body: data,
  });

  return res.json();
}
