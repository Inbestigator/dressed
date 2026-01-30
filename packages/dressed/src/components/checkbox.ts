import {
  type APICheckboxComponent,
  type APICheckboxGroupComponent,
  type APICheckboxGroupOption,
  ComponentType,
} from "discord-api-types/v10";
import { Label } from "./label.ts";

/**
 * A single interactive component for simple yes/no style questions.
 * @important Checkboxes must be placed inside a {@link Label}.
 * @example
 * Label("Subscribe to updates?", Checkbox({ custom_id: "subscribe" }))
 * @see https://discord.com/developers/docs/components/reference#checkbox
 */
export function Checkbox(config: Omit<APICheckboxComponent, "type">): APICheckboxComponent;

/**
 * An option to be used in a checkbox group.
 * @param label User-facing name of the option (max 100 chars)
 * @param value Dev-defined value of the option (max 100 chars)
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
 * An interactive component for selecting one or many options via checkboxes.
 * @important Checkbox Groups must be placed inside a {@link Label}.
 * @example
 * Label(
 *   "Which areas should we improve?",
 *   CheckboxGroup({
 *     custom_id: "improvements",
 *     options: [Checkbox("Performance", "perf"), Checkbox("UI", "ui"), Checkbox("Docs", "docs", { default: true })],
 *     min_values: 1,
 *     max_values: 3,
 *     required: true,
 *   }),
 * )
 * @see https://discord.com/developers/docs/components/reference#checkbox-group
 */
export function CheckboxGroup(config: Omit<APICheckboxGroupComponent, "type">): APICheckboxGroupComponent {
  return { ...config, type: ComponentType.CheckboxGroup };
}
