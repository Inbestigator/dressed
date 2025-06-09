import type {
  APISectionAccessoryComponent,
  APISectionComponent,
} from "discord-api-types/v10";
import { Section as DressedComponent } from "dressed";
import { createElement, isValidElement, type ReactNode } from "react";
import { renderNode, type ComponentNode } from "../react/renderer.ts";
import { type Node } from "../react/node.ts";
import { render } from "../index.tsx";

type SectionProps = Omit<
  APISectionComponent,
  "accessory" | "components" | "type"
> & {
  children: ReactNode;
  accessory: ReactNode;
};

export function Section({ children, accessory, ...rest }: SectionProps) {
  const props = DressedComponent([], accessory as never, rest);
  return createElement("dressed-node", props, children);
}

export async function parseSection<T extends APISectionComponent>(
  props: T,
  children: ComponentNode[],
): Promise<T> {
  let accessory: Node<APISectionAccessoryComponent> = props.accessory as never;

  if (isValidElement(accessory)) {
    accessory = (await render(accessory)).components[0] as never;
  }

  return {
    ...props,
    accessory,
    components: await Promise.all(children.map(renderNode)),
  };
}
