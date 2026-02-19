import type { APITextDisplayComponent } from "discord-api-types/v10";
import { TextDisplay as DressedComponent } from "dressed";
import { createElement, type PropsWithChildren, type ReactElement } from "react";

export function TextDisplay({
  children,
  ...rest
}: PropsWithChildren<Omit<APITextDisplayComponent, "content" | "type">>): ReactElement<APITextDisplayComponent> {
  const props = DressedComponent("", rest);
  return createElement("dressed-node", props, children);
}

export function parseTextDisplay<T extends APITextDisplayComponent>(props: T, children: string): T {
  return { ...props, content: children };
}
