import { type APITextInputComponent, ComponentType, TextInputStyle } from "discord-api-types/v10";
import { Label } from "./label.ts";

/**
 * An interactive component that allows users to enter free-form text responses in modals.
 * It supports both short, single-line inputs and longer, multi-line paragraph inputs.
 * @important Text Inputs must be placed inside a {@link Label}.
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
 * @see https://discord.com/developers/docs/components/reference#text-input
 */
export function TextInput(
  config: Omit<APITextInputComponent, "type" | "style"> & { style?: keyof typeof TextInputStyle },
): APITextInputComponent {
  const style = config?.style ?? "Short";
  return { ...config, style: TextInputStyle[style], type: ComponentType.TextInput };
}
