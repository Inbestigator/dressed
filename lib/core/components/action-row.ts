import {
  type APIActionRowComponent,
  type APIComponentInActionRow,
  ComponentType,
} from "discord-api-types/v10";

/**
 * Creates an action row component
 *
 * Container to display a row of interactive components
 */
export function ActionRow<
  T extends APIComponentInActionRow,
>(
  ...components: T[]
): APIActionRowComponent<T> {
  return {
    components: components as T[],
    type: ComponentType.ActionRow,
  };
}
