import {
  type APICheckboxComponent,
  type APICheckboxGroupComponent,
  type APICheckboxGroupOption,
  ComponentType,
} from "discord-api-types/v10";

/**
 * Creates a checkbox component
 *
 * TODO
 */
export function Checkbox(config: Omit<APICheckboxComponent, "type">): APICheckboxComponent;

export function Checkbox(
  label: string,
  value: string,
  config?: Omit<APICheckboxGroupOption, "label" | "value">,
): APICheckboxGroupOption;

export function Checkbox(
  ...args: [Omit<APICheckboxComponent, "type">] | [string, string, Omit<APICheckboxGroupOption, "label" | "value">?]
): APICheckboxComponent | APICheckboxGroupOption {
  if (typeof args[0] === "string") {
    return { ...args[2], label: args[0], value: args[1] as string };
  }
  return { ...args[0], type: ComponentType.Checkbox };
}

/**
 * Creates a checkbox group component
 *
 * TODO
 */
export function CheckboxGroup(config: Omit<APICheckboxGroupComponent, "type">): APICheckboxGroupComponent {
  return { ...config, type: ComponentType.CheckboxGroup };
}
