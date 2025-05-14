import {
  type APISectionAccessoryComponent,
  type APISectionComponent,
  type APITextDisplayComponent,
  ComponentType,
} from "discord-api-types/v10";
import { TextDisplay } from "./text-display.ts";

/**
 * Creates a section component
 *
 * Container to display text alongside an accessory component
 *
 * @param components - One to three text components
 * @param accessory - A thumbnail or a button component, with a future possibility of adding more compatible components
 *
 * **IMPORTANT**:
 * In order to use this component, you must add the `MessageFlags.IsComponentsV2` flag to your message
 */
export function Section(
  components: (APITextDisplayComponent | string)[],
  accessory: APISectionAccessoryComponent,
  config?: Omit<APISectionComponent, "components" | "accessory" | "type">,
): APISectionComponent {
  return {
    ...config,
    components: components.map((c) =>
      typeof c === "string" ? TextDisplay(c) : c,
    ),
    accessory,
    type: ComponentType.Section,
  };
}
