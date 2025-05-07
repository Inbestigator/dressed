import {
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIComponentInActionRow,
  ComponentType,
} from "discord-api-types/v10";

/**
 * Creates an action row component
 *
 * Provide a list of buttons, a select menu, or a text input
 */
export function ActionRow<
  T extends APIComponentInActionRow,
>(
  ...components: T extends APIButtonComponent ? APIButtonComponent[]
    : [T]
): APIActionRowComponent<T> {
  return {
    components: components as T[],
    type: ComponentType.ActionRow,
  };
}
