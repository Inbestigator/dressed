import { type APIFileUploadComponent, ComponentType } from "discord-api-types/v10";

// TODO add real jsdoc

/**
 * Creates a file upload component
 *
 * Upload files to submit
 */
export function FileUpload(config: Omit<APIFileUploadComponent, "type">): APIFileUploadComponent {
  return {
    ...config,
    type: ComponentType.FileUpload,
  };
}
