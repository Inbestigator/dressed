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
  config: Omit<APITextInputComponent, "type" | "style"> & {
    style?: keyof typeof TextInputStyle;
  },
): APITextInputComponent {
  if (!config.style) config.style = "Short";
  return {
    ...config,
    style: TextInputStyle[config.style],
    type: ComponentType.TextInput,
  };
}
