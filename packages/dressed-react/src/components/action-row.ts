import type { APIActionRowComponent, APIComponentInActionRow } from "discord-api-types/v10";
import { ActionRow as DressedComponent } from "dressed";
import { createElement, type PropsWithChildren, type ReactElement } from "react";
import type { Node } from "../react/node.ts";
import { parseNode } from "../react/renderer.ts";

export function ActionRow({
  children,
}: PropsWithChildren): ReactElement<APIActionRowComponent<APIComponentInActionRow>> {
  const props = DressedComponent();
  return createElement("dressed-node", props, children);
}

export function parseActionRow<T extends APIActionRowComponent<APIComponentInActionRow>>(
  props: T,
  children: Node<APIComponentInActionRow>[],
): T {
  return { ...props, components: children.map(parseNode) };
}
