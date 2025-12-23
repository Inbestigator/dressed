import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { basename, extname, join, relative, resolve } from "node:path";
import { cwd } from "node:process";
import type { WalkEntry } from "../types/walk.ts";
import { logWarn } from "./log.ts";

export function importString(file: WalkEntry) {
  return `import * as h${file.uid} from "${relative(".dressed/tmp", file.path).replace(/\\/g, "/")}";`;
}

export function categoryExports(categories: WalkEntry[][]) {
  return categories.map(
    (c, i) =>
      `export const ${["commands", "components", "events"][i]} = [${c.map((f) => {
        const exportKey = `"exports":h${f.uid}`;
        return JSON.stringify({ ...f, exports: null }).replace('"exports":null', exportKey);
      })}];`,
  );
}

/** Deep merges two objects, producing a new object where values from `b` override those from `a`. */
export function override<T>(a: Partial<T>, b: Partial<T>) {
  const result = { ...a };

  for (const key in b) {
    const k = key as keyof T;
    const bv = b[k];
    const av = a[k];

    if (bv !== undefined && typeof bv === "object" && bv !== null && !Array.isArray(bv)) {
      result[k] = override(av ?? {}, bv) as T[typeof k];
    } else if (bv !== undefined) {
      result[k] = bv as T[typeof k];
    }
  }

  return result;
}

export async function crawlDir(root: string, dir: string, extensions = ["js", "ts", "mjs"]): Promise<WalkEntry[]> {
  const dirPath = resolve(root, dir);

  if (!existsSync(dirPath)) {
    logWarn(`${dir.slice(0, 1).toUpperCase() + dir.slice(1)} directory not found`);
    return [];
  }

  const entries = await readdir(dirPath, { recursive: true });
  return entries
    .filter((e) => extensions.includes(extname(e).slice(1)))
    .map((e) => {
      const path = relative(cwd(), join(dirPath, e));
      return {
        name: basename(path, extname(path)),
        path,
        uid: createHash("sha1").update(path).digest("hex"),
      };
    });
}
