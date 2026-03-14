import type { APIActionRowComponent, APIComponentInActionRow } from "discord-api-types/v10";
import { ActionRow as DressedComponent } from "dressed";
import { createElement, type PropsWithChildren, type ReactElement } from "react";
import { type ComponentNode, parseNode } from "../react/renderer.ts";

export function ActionRow({
  children,
}: PropsWithChildren): ReactElement<APIActionRowComponent<APIComponentInActionRow>> {
  const props = DressedComponent();
  return createElement("dressed-node", props, children);
}

export async function parseActionRow<T extends APIActionRowComponent<APIComponentInActionRow>>(
  props: T,
  children: ComponentNode[],
): Promise<T> {
  return { ...props, components: await Promise.all(children.map(parseNode)) };
}
