import { type APIRadioGroupComponent, type APIRadioGroupOption, ComponentType } from "discord-api-types/v10";
import { Label } from "./label.ts";

/**
 * An interactive component for selecting exactly one option from a defined list.
 * @important Radio Groups must be placed inside a {@link Label}.
 * @example
 * Label(
 *   "Choose your class",
 *   RadioGroup({
 *     custom_id: "class_radio",
 *     options: [
 *       RadioGroupOption("Warrior", "warrior", { description: "Strong and brave" }),
 *       RadioGroupOption("Rogue", "rogue", { description: "Weak and squishy" }),
 *       RadioGroupOption("Wizard", "wizard", { description: "Nerd" }),
 *       RadioGroupOption("Bard", "bard", { description: "Annoys everyone" }),
 *       RadioGroupOption("Witch Doctor", "witch_doctor", { description: "Actually a pretty cool option" }),
 *     ],
 *   }),
 *   "Your class detertmines the style of play for your character.",
 * )
 * @see https://discord.com/developers/docs/components/reference#radio-group
 */
export function RadioGroup(config: Omit<APIRadioGroupComponent, "type">): APIRadioGroupComponent {
  return { ...config, type: ComponentType.RadioGroup };
}

/**
 * An option to be used in a radio group.
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
