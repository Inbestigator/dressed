import {
  type APISectionAccessoryComponent,
  type APISectionComponent,
  ComponentType,
} from "discord-api-types/v10";
import { TextDisplay } from "./text-display.ts";

/**
 * Creates a section component
 *
 * Provide a list of texts to display and an accessory component
 */
export function Section(
  components: string[],
  accessory: APISectionAccessoryComponent,
): APISectionComponent {
  return {
    components: components.map(TextDisplay),
    accessory,
    type: ComponentType.Section,
  };
}
