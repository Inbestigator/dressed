import type { APISelectMenuComponent, APISelectMenuOption, ComponentType } from "discord-api-types/v10";
import { ActionRow } from "./action-row.ts";
import { Label } from "./label.ts";

const SelectType = { Channel: 8, Mentionable: 7, Role: 6, String: 3, User: 5 };

type SelectMap = {
  [Key in keyof typeof ComponentType]: Extract<APISelectMenuComponent, { type: (typeof ComponentType)[Key] }>;
};

/**
 * An interactive component that allows users to select one or more values.
 * @important Selects must be placed inside an {@link ActionRow} in messages and a {@link Label} in modals.
 * @example
 * Label(
 *   "Favorite bug?",
 *   SelectMenu({
 *     type: "String",
 *     custom_id: "favorite_bug",
 *     placeholder: "Ants are the best",
 *     options: [
 *       SelectMenuOption("Ant", "ant", { description: "(best option)", emoji: { name: "🐜" } }),
 *       SelectMenuOption("Butterfly", "butterfly", { emoji: { name: "🦋" } }),
 *       SelectMenuOption("Caterpillar", "caterpillar", { emoji: { name: "🐛" } }),
 *     ],
 *   }),
 * )
 * @example
 * ActionRow(
 *   SelectMenu({
 *     type: "Role",
 *     custom_id: "role_ids",
 *     placeholder: "Which roles?",
 *     min_values: 1,
 *     max_values: 3,
 *   }),
 * )
 * @see https://discord.com/developers/docs/components/reference#string-select
 * @see https://discord.com/developers/docs/components/reference#user-select
 * @see https://discord.com/developers/docs/components/reference#role-select
 * @see https://discord.com/developers/docs/components/reference#string-select
 * @see https://discord.com/developers/docs/components/reference#mentionable-select
 * @see https://discord.com/developers/docs/components/reference#channel-select
 */
export function SelectMenu<K extends keyof typeof SelectType>(
  config: Omit<SelectMap[`${K}Select`], "type"> & { type: K },
): SelectMap[`${K}Select`] {
  return { ...config, type: SelectType[config.type] } as SelectMap[`${K}Select`];
}

/**
 * An option to be used in a select menu
 * @param label User-facing name of the option (max 100 chars)
 * @param value Dev-defined value of the option (max 100 chars)
 */
export function SelectMenuOption(
  label: string,
  value: string,
  config?: Omit<APISelectMenuOption, "label" | "value">,
): APISelectMenuOption {
  return { ...config, label, value };
}
