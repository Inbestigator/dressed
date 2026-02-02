import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { basename, extname, join, relative, resolve } from "node:path";
import { cwd } from "node:process";
import { logger } from "dressed/utils";
import type { WalkEntry } from "../types/walk.ts";

const hash = (v: string) => createHash("sha1").update(v).digest("hex");

/** @returns Import string-able {@link path} relative to the `.dressed` folder */
export function normalizeImportPath(path: string) {
  return relative(".dressed/tmp", path).replace(/\\/g, "/");
}

export function generateFileImport(file: WalkEntry) {
  return `import * as h${hash(file.path)} from "${normalizeImportPath(file.path)}";` as const;
}

/** @returns ESM exports for the input {@link categories} */
export function generateCategoryExports(categories: WalkEntry[][]) {
  return categories.map(
    (c, i) =>
      `export const ${["commands", "components", "events"][i]} = [${c.map((f) =>
        JSON.stringify({ ...f, exports: null }).replace('"exports":null', `"exports":h${hash(f.path)}`),
      )}];`,
  );
}

/** Recursively check for files */
export async function crawlDir(root: string, dir: string, extensions = ["js", "ts", "mjs"]): Promise<WalkEntry[]> {
  const dirPath = resolve(root, dir);

  if (!existsSync(dirPath)) {
    logger.warn(`${dir.slice(0, 1).toUpperCase() + dir.slice(1)} directory not found`);
    return [];
  }

  const entries = await readdir(dirPath, { recursive: true });
  return entries
    .filter((e) => extensions.includes(extname(e).slice(1)))
    .map((e) => {
      const path = relative(cwd(), join(dirPath, e));
      return { name: basename(path, extname(path)), path };
    });
}
