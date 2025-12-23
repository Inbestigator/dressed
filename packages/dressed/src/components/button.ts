import {
  type APIButtonComponentWithCustomId,
  type APIButtonComponentWithSKUId,
  type APIButtonComponentWithURL,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";

interface ButtonWithCustomId extends Omit<APIButtonComponentWithCustomId, "type" | "style"> {
  style?: Exclude<keyof typeof ButtonStyle, "Link" | "Premium">;
}

/**
 * Creates a button component
 *
 * Button object
 */
export function Button(config: ButtonWithCustomId): APIButtonComponentWithCustomId;
export function Button(config: Omit<APIButtonComponentWithSKUId, "type" | "style">): APIButtonComponentWithSKUId;
export function Button(config: Omit<APIButtonComponentWithURL, "type" | "style">): APIButtonComponentWithURL;

export function Button(
  config:
    | ButtonWithCustomId
    | Omit<APIButtonComponentWithSKUId, "type" | "style">
    | Omit<APIButtonComponentWithURL, "type" | "style">,
) {
  let style: keyof typeof ButtonStyle = "Primary";

  if ("style" in config && config.style) style = config.style;
  else if ("sku_id" in config) style = "Premium";
  else if ("url" in config) style = "Link";

  return {
    ...config,
    style: ButtonStyle[style],
    type: ComponentType.Button,
  };
}
