import { type APIFileUploadComponent, ComponentType } from "discord-api-types/v10";
import { Label } from "./label.ts";

/**
 * An interactive component that allows users to upload files in modals.
 * The max file size a user can upload is based on the user's upload limit in that channel.
 * @important File uploads must be placed inside a {@link Label}.
 * @example
 * Label(
 *   "File Upload",
 *   FileUpload({ custom_id: "file_upload" }),
 *   "Please upload a screenshot or other image that shows the bug you encountered.",
 * )
 * @see https://discord.com/developers/docs/components/reference#file-upload
 */
export function FileUpload(config: Omit<APIFileUploadComponent, "type">): APIFileUploadComponent {
  return { ...config, type: ComponentType.FileUpload };
}
