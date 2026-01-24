import { type APIRadioGroupComponent, type APIRadioGroupOption, ComponentType } from "discord-api-types/v10";
import { Label } from "./label.ts";

/**
 * An interactive component for selecting exactly one option from a defined list.
 * @important Radio Groups must be placed inside a {@link Label}.
 * @example
 * Label(
 *   "How satisfied are you?",
 *   RadioGroup({
 *     custom_id: "satisfaction",
 *     options: [
 *       RadioGroupOption("Great", "great", { default: true }),
 *       RadioGroupOption("Okay", "okay"),
 *       RadioGroupOption("Needs work", "needs_work"),
 *     ],
 *     required: true,
 *   }),
 * )
 * @see https://discord.com/developers/docs/components/reference#radio-group
 */
export function RadioGroup(config: Omit<APIRadioGroupComponent, "type">): APIRadioGroupComponent {
  return { ...config, type: ComponentType.RadioGroup };
}

/**
 * An option to be used in a radio group
 * @param label User-facing name of the option (max 100 chars)
 * @param value Dev-defined value of the option (max 100 chars)
 */
export function RadioGroupOption(
  label: string,
  value: string,
  config?: Omit<APIRadioGroupOption, "label" | "value">,
): APIRadioGroupOption {
  return { ...config, label, value };
}
