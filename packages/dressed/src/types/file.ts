import type { Buffer } from "node:buffer";

/** The data for including a file within a `multipart/form-data` request */
export interface RawFile {
  /**
   * The name of the file
   */
  name: string;
  /**
   * The actual data for the file
   */
  data: Buffer | Uint8Array | boolean | number | string;
  /**
   * An explicit string to use as the formdata field key for this file.
   * @default `files[${index}]`
   */
  key?: string;
  /**
   * Content-Type of the file
   */
  contentType?: string;
}
