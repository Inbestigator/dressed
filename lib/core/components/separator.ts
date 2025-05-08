import {
  type APISeparatorComponent,
  ComponentType,
  SeparatorSpacingSize,
} from "discord-api-types/v10";

/**
 * Creates a separator component
 *
 * Component to add vertical padding between other components
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
