import {
  type APISectionAccessoryComponent,
  type APISectionComponent,
  ComponentType,
} from "discord-api-types/v10";
import { TextDisplay } from "./text-display.ts";

/**
 * Creates a section component
 *
 * Container to display text alongside an accessory component
 */
export function Section(
  components: string[],
  accessory: APISectionAccessoryComponent,
  id?: APISectionComponent["id"],
): APISectionComponent {
  return {
    components: components.map(TextDisplay),
    accessory,
    id,
    type: ComponentType.Section,
  };
}
