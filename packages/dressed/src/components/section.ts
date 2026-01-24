import {
  type APISectionAccessoryComponent,
  type APISectionComponent,
  type APITextDisplayComponent,
  ComponentType,
} from "discord-api-types/v10";
import { TextDisplay } from "./text-display.ts";

/**
 * A top-level layout component that allows you to contextually associate content with an accessory component.
 * @param components One to three text components
 * @param accessory A thumbnail or a button component, with a future possibility of adding more compatible components
 * @important In order to use this component, you must add the `MessageFlags.IsComponentsV2` flag to your message.
 * @example
 * Section(
 *   [
 *     "# Real Game v7.3",
 *     "Hope you're excited, the update is finally here! Here are some of the changes:",
 *     "-# That last one wasn't real, but don't use voice chat near furniture just in case...",
 *   ],
 *   Thumbnail("https://websitewithopensourceimages/gamepreview.webp"),
 * )
 * @see https://discord.com/developers/docs/components/reference#section
 */
export function Section(
  components: (APITextDisplayComponent | string)[],
  accessory: APISectionAccessoryComponent,
  config?: Omit<APISectionComponent, "components" | "accessory" | "type">,
): APISectionComponent {
  return {
    ...config,
    components: components.map((c) => (typeof c === "string" ? TextDisplay(c) : c)),
    accessory,
    type: ComponentType.Section,
  };
}
