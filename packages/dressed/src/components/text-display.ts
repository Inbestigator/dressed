import { type APITextDisplayComponent, ComponentType } from "discord-api-types/v10";

/**
 * Creates a text display component
 *
 * Markdown text
 *
 * @param content Text that will be displayed similar to a message
 *
 * **IMPORTANT**:
 * In order to use this component, you must add the `MessageFlags.IsComponentsV2` flag to your message
 */
export function TextDisplay(
  content: string,
  config?: Omit<APITextDisplayComponent, "content" | "type">,
): APITextDisplayComponent {
  return { ...config, content, type: ComponentType.TextDisplay };
}
