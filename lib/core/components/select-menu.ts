import type {
  APISelectMenuComponent,
  ComponentType,
} from "discord-api-types/v10";

enum SelectType {
  Channel = 8,
  Mentionable = 7,
  Role = 6,
  String = 3,
  User = 5,
}

type SelectMap = {
  [Key in keyof typeof ComponentType]: Extract<
    APISelectMenuComponent,
    { type: typeof ComponentType[Key] }
  >;
};

/**
 * Creates a select menu component
 *
 * Select menu for picking from defined text options, or a user, role, channel, or mentionable
 */
export function SelectMenu<K extends keyof typeof SelectType>(
  config:
    & Omit<
      SelectMap[`${K}Select`],
      "type"
    >
    & {
      type: K;
    },
): SelectMap[`${K}Select`] {
  return {
    ...config,
    type: SelectType[config.type],
  } as unknown as SelectMap[`${K}Select`];
}
