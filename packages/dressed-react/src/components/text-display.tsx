import type { APITextDisplayComponent } from "discord-api-types/v10";
import { TextDisplay as DressedComponent } from "dressed";
import { createElement } from "react";

type TextDisplayProps = Omit<APITextDisplayComponent, "content" | "type"> & {
  children: string;
};

export function TextDisplay({ children, ...rest }: TextDisplayProps) {
  const props = DressedComponent("", rest);
  return createElement("dressed-node", props, children);
}

export function parseTextDisplay<T extends APITextDisplayComponent>(
  props: T,
  children: string,
): T {
  return { ...props, content: children };
}
