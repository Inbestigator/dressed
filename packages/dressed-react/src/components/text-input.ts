import type { APITextInputComponent, TextInputStyle } from "discord-api-types/v10";
import { TextInput as DressedComponent } from "dressed";
import { createElement } from "react";

type TextInputProps = Omit<APITextInputComponent, "type" | "style"> & {
  style?: keyof typeof TextInputStyle;
};

export function TextInput(props: TextInputProps) {
  const component = DressedComponent(props);
  return createElement("dressed-node", component);
}
