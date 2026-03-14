import type { APIMediaGalleryComponent, APIMediaGalleryItem } from "discord-api-types/v10";
import { MediaGallery as DressedComponent, MediaGalleryItem as DressedItem } from "dressed";
import { createElement, type PropsWithChildren } from "react";
import type { Node } from "../react/node.ts";

export function MediaGallery({
  children,
  ...rest
}: PropsWithChildren<Omit<APIMediaGalleryComponent, "items" | "type">>) {
  const props = DressedComponent([], rest);
  return createElement("dressed-node", props, children);
}

interface ItemProps extends Omit<APIMediaGalleryItem, "media" | "type"> {
  media: APIMediaGalleryItem["media"] | string;
}

export function MediaGalleryItem({ media, ...rest }: ItemProps) {
  const props = DressedItem(media, rest);
  return createElement("dressed-node", props);
}

export function parseMediaGallery<T extends APIMediaGalleryComponent>(
  props: T,
  children: Node<APIMediaGalleryItem>[],
): T {
  return { ...props, items: children.map((c) => c.props) };
}
