import type { APISectionAccessoryComponent, APISectionComponent, APITextDisplayComponent } from "discord-api-types/v10";
import { Section as DressedComponent } from "dressed";
import { createElement, type PropsWithChildren, type ReactElement, type ReactNode } from "react";
import type { Node } from "../react/node.ts";
import { parseNode } from "../react/renderer.ts";

interface SectionProps extends Omit<APISectionComponent, "accessory" | "components" | "type"> {
  accessory: ReactNode;
}

export function Section({
  children,
  accessory,
  ...rest
}: PropsWithChildren<SectionProps>): ReactElement<APISectionComponent> {
  const props = DressedComponent([], null as never, rest);
  return createElement("dressed-node", props, accessory, children);
}

export function parseSection<T extends APISectionComponent>(
  props: T,
  children: [Node<APISectionAccessoryComponent>, ...Node<APITextDisplayComponent>[]],
): T {
  const [accessory, ...components] = children.map(parseNode);
  return { ...props, accessory, components };
}
