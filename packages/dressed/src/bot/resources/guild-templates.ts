import type {
  RESTDeleteAPIGuildTemplateResult,
  RESTGetAPIGuildTemplatesResult,
  RESTGetAPITemplateResult,
  RESTPatchAPIGuildTemplateJSONBody,
  RESTPatchAPIGuildTemplateResult,
  RESTPostAPIGuildTemplatesJSONBody,
  RESTPostAPIGuildTemplatesResult,
  RESTPostAPITemplateCreateGuildJSONBody,
  RESTPostAPITemplateCreateGuildResult,
  RESTPutAPIGuildTemplateSyncResult,
  Snowflake,
} from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { callDiscord } from "../../utils/call-discord.ts";

/**
 * Returns a guild template object for the given code.
 * @param template The template code to get
 */
export async function getTemplate(
  template: string,
): Promise<RESTGetAPITemplateResult> {
  const res = await callDiscord(Routes.template(template), {
    method: "GET",
  });

  return res.json();
}

/**
 * Create a new guild based on a template.
 * @param template The template code to use
 * @param data The data to use for the new guild
 */
export async function createFromTemplate(
  template: string,
  data: RESTPostAPITemplateCreateGuildJSONBody,
): Promise<RESTPostAPITemplateCreateGuildResult> {
  const res = await callDiscord(Routes.template(template), {
    method: "POST",
    body: data,
  });

  return res.json();
}

/**
 * Returns an array of guild template objects.
 * @param guild The guild to get the templates from
 */
export async function listTemplates(
  guild: Snowflake,
): Promise<RESTGetAPIGuildTemplatesResult> {
  const res = await callDiscord(Routes.guildTemplates(guild), {
    method: "GET",
  });

  return res.json();
}

/**
 * Creates a template for the guild.
 * @param guild The guild to create the template for
 * @param data The template data
 */
export async function createTemplate(
  guild: Snowflake,
  data: RESTPostAPIGuildTemplatesJSONBody,
): Promise<RESTPostAPIGuildTemplatesResult> {
  const res = await callDiscord(Routes.guildTemplates(guild), {
    method: "POST",
    body: data,
  });

  return res.json();
}

/**
 * Syncs the template to the guild's current state.
 * @param guild The guild to sync the template to
 * @param template The template to sync
 */
export async function syncTemplate(
  guild: Snowflake,
  template: string,
): Promise<RESTPutAPIGuildTemplateSyncResult> {
  const res = await callDiscord(Routes.guildTemplate(guild, template), {
    method: "PUT",
  });

  return res.json();
}

/**
 * Modifies the template's metadata.
 * @param guild The guild to modify the template in
 * @param template The template to modify
 * @param data The new template data
 */
export async function modifyTemplate(
  guild: Snowflake,
  template: string,
  data: RESTPatchAPIGuildTemplateJSONBody,
): Promise<RESTPatchAPIGuildTemplateResult> {
  const res = await callDiscord(Routes.guildTemplate(guild, template), {
    method: "PATCH",
    body: data,
  });

  return res.json();
}

/**
 * Deletes the template.
 * @param guild The guild to delete the template in
 * @param template The template to delete
 */
export async function deleteTemplate(
  guild: Snowflake,
  template: string,
): Promise<RESTDeleteAPIGuildTemplateResult> {
  const res = await callDiscord(Routes.guildTemplate(guild, template), {
    method: "DELETE",
  });

  return res.json();
}
