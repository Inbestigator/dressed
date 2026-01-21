import {
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIComponentInActionRow,
  ComponentType,
} from "discord-api-types/v10";

/**
 * Creates an action row component
 *
 * Container to display a row of interactive components
 */
export function ActionRow<T extends APIComponentInActionRow>(
  ...components: (T extends APIButtonComponent ? APIButtonComponent : T)[]
): APIActionRowComponent<T extends APIButtonComponent ? APIButtonComponent : T> {
  return { components, type: ComponentType.ActionRow };
}
