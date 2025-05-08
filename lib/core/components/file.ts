import { type APIFileComponent, ComponentType } from "discord-api-types/v10";

/**
 * Creates a file component
 *
 * Displays an attached file
 *
 * **IMPORTANT**:
 * In order to use this component, you must add the `MessageFlags.IsComponentsV2` flag to your message
 */
export function File(
  file: APIFileComponent["file"] | string,
  config?: Omit<APIFileComponent, "file" | "type">,
): APIFileComponent {
  return {
    ...config,
    file: typeof file === "string" ? { url: file } : file,
    type: ComponentType.File,
  };
}
