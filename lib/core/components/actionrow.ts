import {
  type APIActionRowComponent,
  type APIActionRowComponentTypes,
  type APIButtonComponent,
  ComponentType,
} from "discord-api-types/v10";

/**
 * Creates an action row component
 *
 * Provide a list of buttons, a select menu, or a text input
 */
export function ActionRow<
  T extends APIActionRowComponentTypes,
>(
  ...components: T extends APIButtonComponent ? APIButtonComponent[]
    : [APIActionRowComponentTypes]
): APIActionRowComponent<T> {
  return {
    components: components as T[],
    type: ComponentType.ActionRow,
  };
}
