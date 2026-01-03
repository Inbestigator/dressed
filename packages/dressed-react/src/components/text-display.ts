import type { APITextDisplayComponent } from "discord-api-types/v10";
import { TextDisplay as DressedComponent } from "dressed";
import { createElement, type ReactElement, type ReactNode } from "react";

interface TextDisplayProps extends Omit<APITextDisplayComponent, "content" | "type"> {
  children: ReactNode;
}

export function TextDisplay({ children, ...rest }: TextDisplayProps): ReactElement<APITextDisplayComponent> {
  const props = DressedComponent("", rest);
  return createElement("dressed-node", props, children);
}

export function parseTextDisplay<T extends APITextDisplayComponent>(props: T, children: string): T {
  return { ...props, content: children };
}
