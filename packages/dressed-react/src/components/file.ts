import type { APIFileComponent } from "discord-api-types/v10";
import { File as DressedComponent } from "dressed";
import { createElement, type ReactElement } from "react";

interface FileProps extends Omit<APIFileComponent, "file" | "type"> {
  file: APIFileComponent["file"] | string;
}

export function File({ file, ...rest }: FileProps): ReactElement<APIFileComponent> {
  const props = DressedComponent(file, rest);
  return createElement("dressed-node", props);
}
