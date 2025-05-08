import {
  type APITextInputComponent,
  ComponentType,
  TextInputStyle,
} from "discord-api-types/v10";

/**
 * Creates a text input component
 *
 * Text input object (modals)
 */
export function TextInput(
  data: Omit<APITextInputComponent, "type" | "style"> & {
    style?: keyof typeof TextInputStyle;
  },
): APITextInputComponent {
  if (!data.style) data.style = "Short";
  return {
    ...data,
    style: TextInputStyle[data.style],
    type: ComponentType.TextInput,
  };
}
