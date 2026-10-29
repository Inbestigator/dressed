import type { APIComponentInLabel, APILabelComponent } from "discord-api-types/v10";
import { Label as DressedComponent } from "dressed";
import { createElement, type PropsWithChildren, type ReactElement } from "react";
import type { Node } from "../react/node.ts";
import { parseNode } from "../react/renderer.ts";

export function Label({
  label,
  description,
  children,
  ...rest
}: PropsWithChildren<Omit<APILabelComponent, "component" | "type">>): ReactElement<APILabelComponent> {
  const props = DressedComponent(label, null as never, description, rest);
  return createElement("dressed-node", props, children);
}

export function parseLabel<T extends APILabelComponent>(props: T, children: Node<APIComponentInLabel>[]): T {
  return { ...props, component: children.map(parseNode)[0] };
}
