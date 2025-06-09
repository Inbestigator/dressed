import { Button as DressedComponent } from "dressed";
import { createElement, type ReactElement } from "react";
import {
  type APIButtonComponent,
  type APIButtonComponentWithCustomId,
  type APIButtonComponentWithSKUId,
  type APIButtonComponentWithURL,
  ButtonStyle,
} from "discord-api-types/v10";

interface ButtonWithCustomId
  extends Omit<APIButtonComponentWithCustomId, "type" | "style"> {
  style?: Exclude<keyof typeof ButtonStyle, "Link" | "Premium">;
}

export function Button(
  props: ButtonWithCustomId,
): ReactElement<APIButtonComponentWithCustomId>;
export function Button(
  props: Omit<APIButtonComponentWithSKUId, "type" | "style">,
): ReactElement<APIButtonComponentWithSKUId>;
export function Button(
  props: Omit<APIButtonComponentWithURL, "type" | "style">,
): ReactElement<APIButtonComponentWithURL>;

export function Button(
  props:
    | ButtonWithCustomId
    | Omit<APIButtonComponentWithSKUId, "type" | "style">
    | Omit<APIButtonComponentWithURL, "type" | "style">,
): ReactElement<APIButtonComponent> {
  const component = DressedComponent(props as never);
  return createElement("dressed-node", component);
}
