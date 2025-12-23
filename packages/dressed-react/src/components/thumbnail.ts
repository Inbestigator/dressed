import type { APIThumbnailComponent } from "discord-api-types/v10";
import { Thumbnail as DressedComponent } from "dressed";
import { createElement } from "react";

interface ThumbnailProps extends Omit<APIThumbnailComponent, "media" | "type"> {
  media: APIThumbnailComponent["media"] | string;
}

export function Thumbnail({ media, ...rest }: ThumbnailProps) {
  const props = DressedComponent(media, rest);
  return createElement("dressed-node", props);
}
