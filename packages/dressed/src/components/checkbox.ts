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

/**
 * Creates an option to be used in a checkbox group
 *
 * @param label The user-facing name of the option (max 100 chars)
 * @param value The dev-defined value of the option (max 100 chars)
 */
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
