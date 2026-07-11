import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { basename, extname, join, relative, resolve } from "node:path";
import { cwd } from "node:process";
import { logger } from "dressed/utils";
import glob from "fast-glob";
import type { WalkEntry } from "../types/walk.ts";

const hash = (v: string) => createHash("sha1").update(v).digest("hex");

/** @returns Import string-able {@link path} relative to the `.dressed` folder */
export function normalizeImportPath(path: string) {
  return relative(".dressed/tmp", path).replace(/\\/g, "/");
}

export function generateFileImport(file: WalkEntry) {
  return `import * as h${hash(file.path)} from "${normalizeImportPath(file.path)}";` as const;
}

type EntryObject = Record<string, WalkEntry | Record<string, WalkEntry>>;

/** @returns ESM exports for the input {@link categories} */
export function generateCategoryExports(categories: EntryObject[]) {
  return categories.map(
    (c, i) => `export const ${["commands", "components", "events"][i]} = {${encodeObject(c, i === 1)}};`,
  );
}

function encodeObject(entries: EntryObject, encodeChildren?: boolean): string[] {
  return Object.entries(entries).map(
    ([k, f]) =>
      `${JSON.stringify(k)}:${encodeChildren ? `{${encodeObject(f as EntryObject)}}` : JSON.stringify({ name: f.name, exports: null }).replace('"exports":null', `...h${hash((f as WalkEntry).path)}`)}`,
  );
}

/** Recursively check for files */
export async function crawlDir(root: string, dir: string, include = ["**/*.{js,ts,mjs}"]): Promise<WalkEntry[]> {
  const optional = dir.endsWith("?");
  const dirPath = resolve(root, optional ? dir.slice(0, -1) : dir);

  if (!existsSync(dirPath)) {
    if (!optional) {
      logger.warn(`${dir.slice(0, 1).toUpperCase() + dir.slice(1)} directory not found`);
    }
    return [];
  }

  const entries = await glob(include, { cwd: dirPath });
  return entries.map((e) => {
    const path = relative(cwd(), join(dirPath, e));
    return { name: basename(path, extname(path)), path };
  });
}
