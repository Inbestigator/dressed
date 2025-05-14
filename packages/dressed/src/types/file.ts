import type { Buffer } from "node:buffer";

/** Type ripped from Discord.js (tysm) */
export interface RawFile {
  /**
   * Content-Type of the file
   */
  contentType?: string;
  /**
   * The actual data for the file
   */
  data: Buffer | Uint8Array | boolean | number | string;
  /**
   * An explicit key to use for key of the formdata field for this file.
   * When not provided, the index of the file in the files array is used in the form `files[${index}]`.
   * If you wish to alter the placeholder snowflake, you must provide this property in the same form (`files[${placeholder}]`)
   */
  key?: string;
  /**
   * The name of the file
   */
  name: string;
}
