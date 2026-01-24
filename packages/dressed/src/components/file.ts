import { type APIFileComponent, ComponentType } from "discord-api-types/v10";

/**
 * A top-level content component that allows you to display an [uploaded file](https://discord.com/developers/docs/components/reference#uploading-a-file) as an attachment to the message and reference it in the component.
 * @param file This unfurled media item is unique in that it **only** support attachment references using the `attachment://<filename>` syntax
 * @important In order to use this component, you must add the `MessageFlags.IsComponentsV2` flag to your message.
 * @example
 * File("attachment://game.zip")
 * @see https://discord.com/developers/docs/components/reference#file
 */
export function File(
  file: APIFileComponent["file"] | string,
  config?: Omit<APIFileComponent, "file" | "type">,
): APIFileComponent {
  return { ...config, file: typeof file === "string" ? { url: file } : file, type: ComponentType.File };
}
