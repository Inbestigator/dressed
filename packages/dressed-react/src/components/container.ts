import type { APIContainerComponent } from "discord-api-types/v10";
import { Container as DressedComponent } from "dressed";
import { createElement, type ReactNode } from "react";
import { type ComponentNode, renderNode } from "../react/renderer.ts";

type ContainerProps = Omit<APIContainerComponent, "components" | "type"> & {
  children: ReactNode;
};

export function Container({ children, ...rest }: ContainerProps) {
  const props = DressedComponent([], rest);
  return createElement("dressed-node", props, children);
}

export async function parseContainer<T extends APIContainerComponent>(props: T, children: ComponentNode[]): Promise<T> {
  return { ...props, components: await Promise.all(children.map(renderNode)) };
}
