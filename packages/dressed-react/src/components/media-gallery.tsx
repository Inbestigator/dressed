import type {
  APIMediaGalleryItem,
  APIMediaGalleryComponent,
} from "discord-api-types/v10";
import {
  MediaGallery as DressedComponent,
  MediaGalleryItem as DressedItem,
} from "dressed";
import { createElement, type ReactNode } from "react";
import type { Node } from "../react/node.ts";

type MediaGalleryProps = Omit<APIMediaGalleryComponent, "items" | "type"> & {
  children: ReactNode;
};
type ItemProps = Omit<APIMediaGalleryItem, "media" | "type"> & {
  media: APIMediaGalleryItem["media"] | string;
};
export function MediaGallery({ children, ...rest }: MediaGalleryProps) {
  const props = DressedComponent([], rest);
  return createElement("dressed-node", props, children);
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
