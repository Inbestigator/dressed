import { type APIFileComponent, ComponentType } from "discord-api-types/v10";

/**
 * Creates a file component
 *
 * Displays an attached file
 */
export function File(
  file: APIFileComponent["file"] | string,
  spoiler?: boolean,
  id?: number,
): APIFileComponent {
  return {
    file: typeof file === "string" ? { url: file } : file,
    spoiler,
    id,
    type: ComponentType.File,
  };
}
