import type { APISeparatorComponent, SeparatorSpacingSize } from "discord-api-types/v10";
import { Separator as DressedComponent } from "dressed";
import { createElement, type ReactElement } from "react";

interface SeparatorProps extends Omit<APISeparatorComponent, "type" | "spacing"> {
  spacing?: keyof typeof SeparatorSpacingSize;
}

export function Separator({ spacing, ...props }: SeparatorProps): ReactElement<APISeparatorComponent> {
  const component = DressedComponent({ spacing, ...props });
  return createElement("dressed-node", component);
}
