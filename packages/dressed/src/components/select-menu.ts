import type {
  APISelectMenuComponent,
  APISelectMenuOption,
  ComponentType,
} from "discord-api-types/v10";

const SelectType = {
  Channel: 8,
  Mentionable: 7,
  Role: 6,
  String: 3,
  User: 5,
};

type SelectMap = {
  [Key in keyof typeof ComponentType]: Extract<
    APISelectMenuComponent,
    { type: (typeof ComponentType)[Key] }
  >;
};

/**
 * Creates a select menu component
 *
 * Select menu for picking from defined text options, or a user, role, channel, or mentionable
 */
export function SelectMenu<K extends keyof typeof SelectType>(
  config: Omit<SelectMap[`${K}Select`], "type"> & {
    type: K;
  },
): SelectMap[`${K}Select`] {
  return {
    ...config,
    type: SelectType[config.type],
  } as unknown as SelectMap[`${K}Select`];
}

/**
 * Creates an option to be used in a select menu
 *
 * @param label - The user-facing name of the option (max 100 chars)
 * @param vale - The dev-defined value of the option (max 100 chars)
 */
export function SelectMenuOption(
  label: string,
  value: string,
  config?: Omit<APISelectMenuOption, "label" | "value">,
): APISelectMenuOption {
  return {
    ...config,
    label,
    value,
  };
}
