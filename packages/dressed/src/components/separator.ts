import { type APISeparatorComponent, ComponentType, SeparatorSpacingSize } from "discord-api-types/v10";

/**
 * A top-level layout component that adds vertical padding and visual division between other components.
 * @important In order to use this component, you must add the `MessageFlags.IsComponentsV2` flag to your message.
 * @example
 * Container(TextDisplay("It's dangerous to go alone!"), Separator(), TextDisplay("Take this."))
 * @see https://discord.com/developers/docs/components/reference#separator
 */
export function Separator(
  config?: Omit<APISeparatorComponent, "type" | "spacing"> & { spacing?: keyof typeof SeparatorSpacingSize },
): APISeparatorComponent {
  const spacing = config?.spacing ?? "Small";
  return { ...config, spacing: SeparatorSpacingSize[spacing], type: ComponentType.Separator };
}
