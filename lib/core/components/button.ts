import {
  type APIButtonComponent,
  type APIButtonComponentWithCustomId,
  type APIButtonComponentWithSKUId,
  type APIButtonComponentWithURL,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";

type StringButtonStyle =
  | "Primary"
  | "Secondary"
  | "Success"
  | "Danger"
  | "Link"
  | "Premium";

interface ButtonWithCustomId
  extends Omit<APIButtonComponentWithCustomId, "type" | "style"> {
  style?: StringButtonStyle;
}

interface ButtonWithSKUId
  extends Omit<APIButtonComponentWithSKUId, "type" | "style"> {
  style?: StringButtonStyle;
}

interface ButtonWithURL
  extends Omit<APIButtonComponentWithURL, "type" | "style"> {
  style?: StringButtonStyle;
}

interface Button {
  style?: ButtonStyle;
  type?: ComponentType.Button;
}

/**
 * Creates a button component
 */
export function Button(
  data: ButtonWithCustomId | ButtonWithSKUId | ButtonWithURL,
): APIButtonComponent {
  const button = data as Button;
  button.type = ComponentType.Button;
  if (!data.style) data.style = "Primary";
  button.style = ButtonStyle[data.style];
  return button as APIButtonComponent;
}
