import {
  type APISeparatorComponent,
  ComponentType,
  SeparatorSpacingSize,
} from "discord-api-types/v10";

/**
 * Creates a separator component
 */
export function Separator(
  divider = true,
  spacing: keyof typeof SeparatorSpacingSize = "Small",
): APISeparatorComponent {
  return {
    divider,
    spacing: SeparatorSpacingSize[spacing],
    type: ComponentType.Separator,
  };
}
