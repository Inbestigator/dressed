import {
  type APIMediaGalleryComponent,
  type APIMediaGalleryItem,
  ComponentType,
} from "discord-api-types/v10";
import { Thumbnail } from "./thumbnail.ts";

/**
 * Creates a media gallery component
 *
 * Display images and other media
 *
 * **IMPORTANT**:
 * In order to use this component, you must add the `MessageFlags.IsComponentsV2` flag to your message
 */
export function MediaGallery(
  items: APIMediaGalleryItem[],
  config: Omit<APIMediaGalleryComponent, "items" | "type">,
): APIMediaGalleryComponent;

export function MediaGallery(
  ...items: APIMediaGalleryItem[]
): APIMediaGalleryComponent;

export function MediaGallery(
  ...args: [
    APIMediaGalleryItem[],
    Omit<APIMediaGalleryComponent, "items" | "type">,
  ] | APIMediaGalleryItem[]
): APIMediaGalleryComponent {
  if (Array.isArray(args[0]) && args.length === 2) {
    const [items, config] = args as [
      APIMediaGalleryItem[],
      Omit<APIMediaGalleryComponent, "items" | "type">,
    ];
    return {
      ...config,
      items,
      type: ComponentType.MediaGallery,
    };
  } else {
    const items = args as APIMediaGalleryItem[];
    return {
      items,
      type: ComponentType.MediaGallery,
    };
  }
}

/**
 * Creates a media item to be used in a media gallery
 */
export function MediaGalleryItem(
  ...args: Parameters<typeof Thumbnail>
): APIMediaGalleryItem {
  const { type: _type, id: _id, ...item } = Thumbnail(...args);
  return item;
}
