import type { APILabelComponent } from "discord-api-types/v10";
import { Label as DressedComponent } from "dressed";
import { createElement, type ReactElement, type ReactNode } from "react";
import { type ComponentNode, renderNode } from "../react/renderer.ts";

interface LabelProps extends Omit<APILabelComponent, "component" | "type"> {
  children: ReactNode;
}

export function Label({ label, description, children, ...rest }: LabelProps): ReactElement<APILabelComponent> {
  const props = DressedComponent(label, null as never, description, rest);
  return createElement("dressed-node", props, children);
}

export async function parseLabel<T extends APILabelComponent>(props: T, children: ComponentNode[]): Promise<T> {
  return {
    ...props,
    component: (await Promise.all(children.map(renderNode)))[0],
  };
}
