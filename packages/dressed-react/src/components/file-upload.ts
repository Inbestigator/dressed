import type { APIFileUploadComponent } from "discord-api-types/v10";
import { FileUpload as DressedComponent } from "dressed";
import { createElement, type ReactElement } from "react";

export function FileUpload(props: Omit<APIFileUploadComponent, "type">): ReactElement<APIFileUploadComponent> {
  const component = DressedComponent(props);
  return createElement("dressed-node", component);
}
