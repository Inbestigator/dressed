import type { APIFileUploadComponent } from "discord-api-types/v10";
import { FileUpload as DressedComponent } from "dressed";
import { createElement, type ReactElement } from "react";

export function FileUpload(config: Omit<APIFileUploadComponent, "type">): ReactElement<APIFileUploadComponent> {
  const props = DressedComponent(config);
  return createElement("dressed-node", props);
}
