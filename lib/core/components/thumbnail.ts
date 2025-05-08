import {
  type APIThumbnailComponent,
  ComponentType,
} from "discord-api-types/v10";

/**
 * Creates a thumbnail component
 *
 * Small image that can be used as an accessory
 */
export function Thumbnail(
  media: APIThumbnailComponent["media"] | string,
  description?: string,
  spoiler?: boolean,
  id?: number,
): APIThumbnailComponent {
  return {
    media: typeof media === "string" ? { url: media } : media,
    description,
    spoiler,
    id,
    type: ComponentType.Thumbnail,
  };
}
