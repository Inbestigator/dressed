import { ActionRow as DressedComponent } from "dressed";
import { createElement, type ReactElement, type ReactNode } from "react";
import type {
  APIActionRowComponent,
  APIComponentInActionRow,
} from "discord-api-types/v10";
import { renderNode, type ComponentNode } from "../react/renderer.ts";

export function ActionRow({
  children,
}: {
  children: ReactNode;
}): ReactElement<APIActionRowComponent<APIComponentInActionRow>> {
  const props = DressedComponent();
  return createElement("dressed-node", props, children);
}

export async function parseActionRow<
  T extends APIActionRowComponent<APIComponentInActionRow>,
>(props: T, children: ComponentNode[]): Promise<T> {
  return { ...props, components: await Promise.all(children.map(renderNode)) };
}
