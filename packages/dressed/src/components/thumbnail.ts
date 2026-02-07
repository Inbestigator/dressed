import { type APIThumbnailComponent, ComponentType } from "discord-api-types/v10";
import { Section } from "./section.ts";

/**
 * A content component that displays visual media in a small form-factor.
 * @param media A url or attachment
 * @important Thumbnails must be placed inside a {@link Section}'s `accessory` field.
 * @example
 * Section(
 *   [
 *     "# Real Game v7.3",
 *     "Hope you're excited, the update is finally here! Here are some of the changes:",
 *     "-# That last one wasn't real, but don't use voice chat near furniture just in case...",
 *   ],
 *   Thumbnail("https://websitewithopensourceimages/gamepreview.webp"),
 * )
 * @see https://discord.com/developers/docs/components/reference#thumbnails
 */
export function Thumbnail(
  media: APIThumbnailComponent["media"] | string,
  config?: Omit<APIThumbnailComponent, "media" | "type">,
): APIThumbnailComponent {
  return { ...config, media: typeof media === "string" ? { url: media } : media, type: ComponentType.Thumbnail };
}
