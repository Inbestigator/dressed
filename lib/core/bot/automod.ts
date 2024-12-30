import type {
  RESTGetAPIAutoModerationRuleResult,
  RESTGetAPIAutoModerationRulesResult,
  RESTPatchAPIAutoModerationRuleJSONBody,
  RESTPatchAPIAutoModerationRuleResult,
  RESTPostAPIAutoModerationRuleJSONBody,
  RESTPostAPIAutoModerationRuleResult,
  Snowflake,
} from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { callDiscord } from "../../internal/utils.ts";

/**
 * Get a list of a guild's automod rules.
 * @param guild The guild to get the rules from
 */
export async function listAutomodRules(
  guild: Snowflake,
): Promise<RESTGetAPIAutoModerationRulesResult> {
  const res = await callDiscord(Routes.guildAutoModerationRules(guild), {
    method: "GET",
  });

  return res.json();
}

/**
 * Get a specific automod rule.
 * @param guild The guild to get the rule from
 * @param rule The rule to get
 */
export async function getAutomodRule(
  guild: Snowflake,
  rule: string,
): Promise<RESTGetAPIAutoModerationRuleResult> {
  const res = await callDiscord(Routes.guildAutoModerationRule(guild, rule), {
    method: "GET",
  });

  return res.json();
}

/**
 * Create a new automod rule.
 * @param guild The guild to create the rule for
 * @param data The rule data
 */
export async function createAutomodRule(
  guild: Snowflake,
  data: RESTPostAPIAutoModerationRuleJSONBody,
): Promise<RESTPostAPIAutoModerationRuleResult> {
  const res = await callDiscord(Routes.guildAutoModerationRules(guild), {
    method: "POST",
    body: data,
  });

  return res.json();
}

/**
 * Update an automod rule.
 * @param guild The guild to update the rule in
 * @param rule The rule to update
 * @param data The new rule data
 */
export async function modifyAutomodRule(
  guild: Snowflake,
  rule: string,
  data: RESTPatchAPIAutoModerationRuleJSONBody,
): Promise<RESTPatchAPIAutoModerationRuleResult> {
  const res = await callDiscord(Routes.guildAutoModerationRule(guild, rule), {
    method: "PATCH",
    body: data,
  });

  return res.json();
}

/**
 * Delete an automod rule.
 * @param guild The guild to delete the rule from
 * @param rule The rule to delete
 */
export async function deleteAutomodRule(
  guild: Snowflake,
  rule: string,
): Promise<void> {
  await callDiscord(Routes.guildAutoModerationRule(guild, rule), {
    method: "DELETE",
  });
}
