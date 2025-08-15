import {
  type APIButtonComponentWithCustomId,
  type APIButtonComponentWithSKUId,
  type APIButtonComponentWithURL,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";

interface ButtonWithCustomId
  extends Omit<APIButtonComponentWithCustomId, "type" | "style"> {
  style?: Exclude<keyof typeof ButtonStyle, "Link" | "Premium">;
}

/**
 * Creates a button component
 *
 * Button object
 */
export function Button(
  config: ButtonWithCustomId,
): APIButtonComponentWithCustomId;
export function Button(
  config: Omit<APIButtonComponentWithSKUId, "type" | "style">,
): APIButtonComponentWithSKUId;
export function Button(
  config: Omit<APIButtonComponentWithURL, "type" | "style">,
): APIButtonComponentWithURL;

export function Button(
  config:
    | ButtonWithCustomId
    | Omit<APIButtonComponentWithSKUId, "type" | "style">
    | Omit<APIButtonComponentWithURL, "type" | "style">,
) {
  const style: keyof typeof ButtonStyle =
    "style" in config && config.style
      ? config.style
      : "sku_id" in config
        ? "Premium"
        : "url" in config
          ? "Link"
          : "Primary";

  return {
    ...config,
    style: ButtonStyle[style],
    type: ComponentType.Button,
  };
}
