import {
  type APITextDisplayComponent,
  ComponentType,
} from "discord-api-types/v10";

/**
 * Creates a text display component
 */
export function TextDisplay(
  content: string,
): APITextDisplayComponent {
  return {
    content,
    type: ComponentType.TextDisplay,
  };
}
