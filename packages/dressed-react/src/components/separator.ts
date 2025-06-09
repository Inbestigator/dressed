import type {
  APISeparatorComponent,
  SeparatorSpacingSize,
} from "discord-api-types/v10";
import { Separator as DressedComponent } from "dressed";
import { createElement } from "react";

type SeparatorProps = Omit<APISeparatorComponent, "type" | "spacing"> & {
  spacing?: keyof typeof SeparatorSpacingSize;
};

export function Separator(props: SeparatorProps) {
  const component = DressedComponent(props);
  return createElement("dressed-node", component);
}
