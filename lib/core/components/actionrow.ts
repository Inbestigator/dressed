import type {
  APIActionRowComponent,
  APIActionRowComponentTypes,
} from "discord-api-types/v10";

/**
 * Creates an action row component
 */
export function ActionRow<T extends APIActionRowComponentTypes>(
  ...components: T[]
): APIActionRowComponent<T> {
  return {
    components: components as T[],
    type: 1,
  };
}
