import type { APIContainerComponent } from "discord-api-types/v10";
import { Container as DressedComponent } from "dressed";
import { createElement, type PropsWithChildren, type ReactElement } from "react";
import { type ComponentNode, parseNode } from "../react/renderer.ts";

export function Container({
  children,
  ...rest
}: PropsWithChildren<Omit<APIContainerComponent, "components" | "type">>): ReactElement<APIContainerComponent> {
  const props = DressedComponent([], rest);
  return createElement("dressed-node", props, children);
}

export async function parseContainer<T extends APIContainerComponent>(props: T, children: ComponentNode[]): Promise<T> {
  return { ...props, components: await Promise.all(children.map(parseNode)) };
}
