import type { APIFileComponent } from "discord-api-types/v10";
import { File as DressedComponent } from "dressed";
import { createElement } from "react";

type FileProps = Omit<APIFileComponent, "file" | "type"> & {
  file: APIFileComponent["file"] | string;
};

export function File({ file, ...rest }: FileProps) {
  const props = DressedComponent(file, rest);
  return createElement("dressed-node", props);
}
