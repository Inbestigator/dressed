import {
  type APIThumbnailComponent,
  ComponentType,
} from "discord-api-types/v10";

/**
 * Creates a thumbnail component
 *
 * Small image that can be used as an accessory
 *
 * @param media A url or attachment
 *
 * **IMPORTANT**:
 * In order to use this component, you must add the `MessageFlags.IsComponentsV2` flag to your message
 */
export function Thumbnail(
  media: APIThumbnailComponent["media"] | string,
  config?: Omit<APIThumbnailComponent, "media" | "type">,
): APIThumbnailComponent {
  return {
    ...config,
    media: typeof media === "string" ? { url: media } : media,
    type: ComponentType.Thumbnail,
  };
}
