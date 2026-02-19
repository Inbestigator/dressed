import type { APILabelComponent } from "discord-api-types/v10";
import { Label as DressedComponent } from "dressed";
import { createElement, type PropsWithChildren, type ReactElement } from "react";
import { type ComponentNode, parseNode } from "../react/renderer.ts";

export function Label({
  label,
  description,
  children,
  ...rest
}: PropsWithChildren<Omit<APILabelComponent, "component" | "type">>): ReactElement<APILabelComponent> {
  const props = DressedComponent(label, null as never, description, rest);
  return createElement("dressed-node", props, children);
}

export async function parseLabel<T extends APILabelComponent>(props: T, children: ComponentNode[]): Promise<T> {
  return {
    ...props,
    component: (await Promise.all(children.map(parseNode)))[0],
  };
}
