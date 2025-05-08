import {
  type APITextDisplayComponent,
  ComponentType,
} from "discord-api-types/v10";

/**
 * Creates a text display component
 *
 * Markdown text
 *
 * **IMPORTANT**:
 * In order to use this component, you must add the `MessageFlags.IsComponentsV2` flag to your message
 */
export function TextDisplay(
  content: string,
): APITextDisplayComponent {
  return {
    content,
    type: ComponentType.TextDisplay,
  };
}
