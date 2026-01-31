import {
  type APICheckboxComponent,
  type APICheckboxGroupComponent,
  type APIComponentInLabel,
  type APILabelComponent,
  type APIRadioGroupComponent,
  ComponentType,
} from "discord-api-types/v10";

/**
 * A top-level layout component.
 * Labels wrap modal components with text as a label and optional description.
 * @param label The label text; max 45 characters
 * @param component The component within the label
 * @param description An optional description text for the label; max 100 characters
 * @example
 * Label(
 *   "What did you find interesting about the game?",
 *   TextInput({
 *     custom_id: "game_feedback",
 *     label: "Write your feedback here...",
 *     style: "Paragraph",
 *     min_length: 100,
 *     max_length: 4000,
 *     required: true,
 *   }),
 *   "Please give us as much detail as possible so we can improve the game!",
 * )
 * @see https://discord.com/developers/docs/components/reference#label
 */
export function Label(
  label: string,
  component: APIComponentInLabel | APICheckboxComponent | APICheckboxGroupComponent | APIRadioGroupComponent,
  description?: string,
  config?: Omit<APILabelComponent, "label" | "component" | "description" | "type">,
): APILabelComponent {
  return { ...config, label, description, component, type: ComponentType.Label } as APILabelComponent;
}
