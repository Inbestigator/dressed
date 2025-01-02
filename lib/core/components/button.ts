import {
  type APIButtonComponent,
  type APIButtonComponentWithCustomId,
  type APIButtonComponentWithSKUId,
  type APIButtonComponentWithURL,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";

interface ButtonWithCustomId
  extends Omit<APIButtonComponentWithCustomId, "type" | "style"> {
  sku_id?: never;
  url?: never;
}

interface ButtonWithSKUId
  extends Omit<APIButtonComponentWithSKUId, "type" | "style"> {
  custom_id?: never;
  url?: never;
}

interface ButtonWithURL
  extends Omit<(APIButtonComponentWithURL), "type" | "style"> {
  custom_id?: never;
  sku_id?: never;
}

interface Button {
  style?: ButtonStyle;
  type?: ComponentType.Button;
}

/**
 * Creates a button component
 */
export function Button(
  data: (ButtonWithCustomId | ButtonWithSKUId | ButtonWithURL) & {
    style?: keyof typeof ButtonStyle;
  },
): APIButtonComponent {
  const button = data as Button;
  button.type = ComponentType.Button;
  if (!data.style) data.style = "Primary";
  button.style = ButtonStyle[data.style];
  return button as APIButtonComponent;
}
