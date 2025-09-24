import type { APIFileUploadComponent } from "discord-api-types/v10";
import { FileUpload as DressedComponent } from "dressed";
import { createElement } from "react";

export function FileUpload(props: Omit<APIFileUploadComponent, "type">) {
  const component = DressedComponent(props);
  return createElement("dressed-node", component);
}
