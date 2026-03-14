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
 * @tip While you cannot set a checkbox as required, you can use a {@link CheckboxGroup} with a single option and `required` to achieve similar functionality.
 * @example
 * Label("Do you like me?", Checkbox({ custom_id: "like_checkbox" }), "😳😳😳")
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
 *   "Which days are you free?",
 *   CheckboxGroup({
 *     custom_id: "event_checkbox",
 *     options: [
 *       Checkbox("March 4th", "march-4"),
 *       Checkbox("March 5th", "march-5"),
 *       Checkbox("March 7th", "march-7", { description: "I know this is a Saturday and is tough" }),
 *       Checkbox("March 9th", "march-9"),
 *       Checkbox("March 10th", "march-10"),
 *     ],
 *   }),
 *   "Choose all of the days you're able to meet up.",
 * )
 * @see https://discord.com/developers/docs/components/reference#checkbox-group
 */
export function CheckboxGroup(config: Omit<APICheckboxGroupComponent, "type">): APICheckboxGroupComponent {
  return { ...config, type: ComponentType.CheckboxGroup };
}
