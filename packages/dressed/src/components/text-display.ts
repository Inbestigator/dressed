import { type APITextDisplayComponent, ComponentType } from "discord-api-types/v10";

/**
 * A content component that allows you to add markdown formatted text, including mentions (users, roles, etc) and emojis.
 * The behavior of this component is extremely similar to the [`content` field of a message](https://discord.com/developers/docs/resources/message#message-object), but allows you to add multiple text components, controlling the layout of your message.
 * @param content Text that will be displayed similar to a message
 * @important In order to use this component, you must add the `MessageFlags.IsComponentsV2` flag to your message.
 * @example
 * TextDisplay("# This is a Text Display\nAll the regular markdown rules apply")
 * @see https://discord.com/developers/docs/components/reference#text-display
 */
export function TextDisplay(
  content: string,
  config?: Omit<APITextDisplayComponent, "content" | "type">,
): APITextDisplayComponent {
  return { ...config, content, type: ComponentType.TextDisplay };
}
