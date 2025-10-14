import { type APIFileUploadComponent, ComponentType } from "discord-api-types/v10";

/**
 * Creates a file upload component
 *
 * Component for uploading files
 */
export function FileUpload(config: Omit<APIFileUploadComponent, "type">): APIFileUploadComponent {
  return {
    ...config,
    type: ComponentType.FileUpload,
  };
}
