import type { APIComponentInContainer, APIContainerComponent } from "discord-api-types/v10";
import { Container as DressedComponent } from "dressed";
import { createElement, type PropsWithChildren, type ReactElement } from "react";
import type { Node } from "../react/node.ts";
import { parseNode } from "../react/renderer.ts";

export function Container({
  children,
  ...rest
}: PropsWithChildren<Omit<APIContainerComponent, "components" | "type">>): ReactElement<APIContainerComponent> {
  const props = DressedComponent([], rest);
  return createElement("dressed-node", props, children);
}

export function parseContainer<T extends APIContainerComponent>(
  props: T,
  children: Node<APIComponentInContainer>[],
): T {
  return { ...props, components: children.map(parseNode) };
}
