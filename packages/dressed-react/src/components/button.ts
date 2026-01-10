import type {
  APIButtonComponent,
  APIButtonComponentWithCustomId,
  APIButtonComponentWithSKUId,
  APIButtonComponentWithURL,
  ButtonStyle,
} from "discord-api-types/v10";
import { Button as DressedComponent } from "dressed";
import { createElement, type ReactElement, useEffect, useState } from "react";
import { registerHandler } from "../rendering/callbacks.ts";
import type { MessageComponentInteraction } from "../rendering/interaction.ts";

interface ButtonWithCustomId extends Omit<APIButtonComponentWithCustomId, "type" | "style"> {
  style?: Exclude<keyof typeof ButtonStyle, "Link" | "Premium">;
}

interface ButtonWithOnClick extends Omit<ButtonWithCustomId, "custom_id"> {
  /**
   * Create a temporary handler callback, will not work in a serverless environment
   * @warn Callbacks are deleted after 30 minutes. If you wish to have a more permanent handler, it's strongly recommended to use the [traditional component system](https://dressed.js.org/docs/components).
   */
  onClick: (interaction: MessageComponentInteraction<"Button">) => void;
  /** An additional handler identity defined in the callback setup which will run if the `onClick` is no longer registered */
  fallback?: string;
}

export function Button(props: ButtonWithCustomId): ReactElement<APIButtonComponentWithCustomId>;
export function Button(props: ButtonWithOnClick): ReactElement<APIButtonComponentWithCustomId>;
export function Button(
  props: Omit<APIButtonComponentWithSKUId, "type" | "style">,
): ReactElement<APIButtonComponentWithSKUId>;
export function Button(
  props: Omit<APIButtonComponentWithURL, "type" | "style">,
): ReactElement<APIButtonComponentWithURL>;

export function Button(
  props:
    | ButtonWithCustomId
    | ButtonWithOnClick
    | Omit<APIButtonComponentWithSKUId, "type" | "style">
    | Omit<APIButtonComponentWithURL, "type" | "style">,
): ReactElement<APIButtonComponent> {
  const [registeredHandler, setRegisteredHandler] = useState<ReturnType<typeof registerHandler>>();

  useEffect(() => {
    if ("onClick" in props) {
      setRegisteredHandler((p) => registerHandler(props.onClick as never, props.fallback, p?.$registeredHandler));
    }
  }, [props]);

  const component = DressedComponent({ ...props, ...registeredHandler } as never);
  return createElement("dressed-node", component);
}
