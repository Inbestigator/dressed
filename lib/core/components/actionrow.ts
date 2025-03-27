import {
  type APIActionRowComponent,
  type APIButtonComponent,
  type APISelectMenuComponent,
  type APITextInputComponent,
  ComponentType,
} from "discord-api-types/v10";

/**
 * Creates an action row component
 *
 * Provide a list of buttons, a select menu, or a text input
 */
export function ActionRow<
  T extends
    | APIButtonComponent[]
    | [APISelectMenuComponent]
    | [APITextInputComponent],
>(
  ...components: T
): APIActionRowComponent<Component<T>> {
  return {
    components: components as Component<T>[],
    type: ComponentType.ActionRow,
  };
}

type Component<T> = T extends APIButtonComponent[] ? APIButtonComponent
  : T extends [
    APISelectMenuComponent,
  ] ? APISelectMenuComponent
  : T extends [APITextInputComponent] ? APITextInputComponent
  : never;
