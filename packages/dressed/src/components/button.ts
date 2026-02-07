import {
  type APIButtonComponentWithCustomId,
  type APIButtonComponentWithSKUId,
  type APIButtonComponentWithURL,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import { ActionRow } from "./action-row.ts";
import { Section } from "./section.ts";

interface ButtonWithCustomId extends Omit<APIButtonComponentWithCustomId, "type" | "style"> {
  style?: Exclude<keyof typeof ButtonStyle, "Link" | "Premium">;
}

/**
 * An interactive component that can only be used in messages.
 * @important Buttons must be placed inside an {@link ActionRow} or a {@link Section}'s `accessory` field.
 * @example
 * ActionRow(Button({ custom_id: "click_me", label: "Click me!" }))
 * @example
 * Section(["Search here"], Button({ url: "https://google.com", label: "Google" }))
 * @see https://discord.com/developers/docs/components/reference#button
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

  return { ...config, style: ButtonStyle[style], type: ComponentType.Button };
}
