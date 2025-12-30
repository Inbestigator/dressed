import type { APITextInputComponent, TextInputStyle } from "discord-api-types/v10";
import { TextInput as DressedComponent } from "dressed";
import { createElement, type ReactElement } from "react";

interface TextInputProps extends Omit<APITextInputComponent, "type" | "style"> {
  style?: keyof typeof TextInputStyle;
}

export function TextInput({ style, ...props }: TextInputProps): ReactElement<APITextInputComponent> {
  const component = DressedComponent({ style, ...props });
  return createElement("dressed-node", component);
}
