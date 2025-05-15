import { join } from "node:path";
import { cwd } from "node:process";

export default async function importUserFile<T>(file: {
  path: string;
  import?: () => Promise<T>;
}) {
  // Import is needed if the bot will be run in a compiled environment, like Next.js
  if (file.import) {
    return file.import();
  }
  return import(join(cwd(), file.path)) as Promise<T>;
}
