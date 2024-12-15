import {
  type APITextInputComponent,
  ComponentType,
  TextInputStyle,
} from "discord-api-types/v10";

type InputStyle = "Short" | "Paragraph";

/**
 * Creates a text input component
 */
export function TextInput(
  data: Omit<APITextInputComponent, "type" | "style"> & {
    style?: InputStyle;
  },
): APITextInputComponent {
  if (!data.style) data.style = "Short";
  const input = {
    ...data,
    style: TextInputStyle[data.style],
    type: ComponentType.TextInput,
  };

  return input as APITextInputComponent;
}
