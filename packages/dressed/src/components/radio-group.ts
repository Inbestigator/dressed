import { type APIRadioGroupComponent, type APIRadioGroupOption, ComponentType } from "discord-api-types/v10";

/**
 * Creates a radio group component
 *
 * TODO
 */
export function RadioGroup(config: Omit<APIRadioGroupComponent, "type">): APIRadioGroupComponent {
  return { ...config, type: ComponentType.RadioGroup };
}

/**
 * Creates an option to be used in a radio group
 *
 * @param label The user-facing name of the option (max 100 chars)
 * @param value The dev-defined value of the option (max 100 chars)
 */
export function RadioGroupOption(
  label: string,
  value: string,
  config?: Omit<APIRadioGroupOption, "label" | "value">,
): APIRadioGroupOption {
  return { ...config, label, value };
}
