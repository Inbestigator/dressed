import { type APISeparatorComponent, ComponentType, SeparatorSpacingSize } from "discord-api-types/v10";

/**
 * Creates a separator component
 *
 * Component to add vertical padding between other components
 *
 * **IMPORTANT**:
 * In order to use this component, you must add the `MessageFlags.IsComponentsV2` flag to your message
 */
export function Separator(
  config?: Omit<APISeparatorComponent, "type" | "spacing"> & {
    spacing?: keyof typeof SeparatorSpacingSize;
  },
): APISeparatorComponent {
  const spacing = config?.spacing ?? "Small";
  return {
    ...config,
    spacing: SeparatorSpacingSize[spacing],
    type: ComponentType.Separator,
  };
}
