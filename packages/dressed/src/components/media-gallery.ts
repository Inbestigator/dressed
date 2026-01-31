import { type APIMediaGalleryComponent, type APIMediaGalleryItem, ComponentType } from "discord-api-types/v10";
import { Thumbnail } from "./thumbnail.ts";

/**
 * A top-level content component that allows you to display 1-10 media attachments in an organized gallery format.
 * @param items 1 to 10 media gallery items
 * @important In order to use this component, you must add the `MessageFlags.IsComponentsV2` flag to your message.
 * @example
 * MediaGallery(
 *   MediaGalleryItem("https://livevideofeedconvertedtoimage/webcam1.webp", {
 *     description: "An aerial view looking down on older industrial complex buildings.",
 *   }),
 *   MediaGalleryItem("https://livevideofeedconvertedtoimage/webcam2.webp", {
 *     description: "An aerial view of old broken buildings.",
 *   }),
 *   MediaGalleryItem("https://livevideofeedconvertedtoimage/webcam3.webp", {
 *     description: "A street view of a downtown city.",
 *   }),
 * )
 * @see https://discord.com/developers/docs/components/reference#media-gallery
 */
export function MediaGallery(
  items: APIMediaGalleryItem[],
  config: Omit<APIMediaGalleryComponent, "items" | "type">,
): APIMediaGalleryComponent;

export function MediaGallery(...items: APIMediaGalleryItem[]): APIMediaGalleryComponent;

export function MediaGallery(
  ...args: [APIMediaGalleryItem[], Omit<APIMediaGalleryComponent, "items" | "type">] | APIMediaGalleryItem[]
): APIMediaGalleryComponent {
  if (Array.isArray(args[0]) && args.length === 2) {
    const [items, config] = args as [APIMediaGalleryItem[], Omit<APIMediaGalleryComponent, "items" | "type">];
    return { ...config, items, type: ComponentType.MediaGallery };
  } else {
    const items = args as APIMediaGalleryItem[];
    return { items, type: ComponentType.MediaGallery };
  }
}

/**
 * An item to be used in a media gallery
 */
export function MediaGalleryItem(...config: Parameters<typeof Thumbnail>): APIMediaGalleryItem {
  const { type, id, ...item } = Thumbnail(...config);
  return item;
}
