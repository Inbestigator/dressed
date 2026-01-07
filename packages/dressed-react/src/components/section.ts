import type { APISectionComponent } from "discord-api-types/v10";
import { Section as DressedComponent } from "dressed";
import { createElement, type ReactElement, type ReactNode } from "react";
import { type ComponentNode, parseNode } from "../react/renderer.ts";

interface SectionProps extends Omit<APISectionComponent, "accessory" | "components" | "type"> {
  children: ReactNode;
  accessory: ReactNode;
}

export function Section({ children, accessory, ...rest }: SectionProps): ReactElement<APISectionComponent> {
  const props = DressedComponent([], null as never, rest);
  return createElement("dressed-node", props, accessory, children);
}

export async function parseSection<T extends APISectionComponent>(props: T, children: ComponentNode[]): Promise<T> {
  const [accessory, ...components] = await Promise.all(children.map(parseNode));
  return { ...props, accessory, components };
}
