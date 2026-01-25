import { relative } from "node:path";
import type { BaseData } from "dressed/server";
import { logger } from "dressed/utils";
import type { WalkEntry } from "../../types/walk.ts";
import logTree from "../log-tree.ts";

interface ParserItemMessages {
  confict: string;
  cols?: string[];
}

type ImportedEntry<T extends BaseData<unknown>> = WalkEntry & { exports: T["exports"] };

export function createHandlerParser<T extends BaseData<Record<keyof T["data"], unknown> | undefined>>(options: {
  colNames: string[];
  uniqueKeys?: (keyof T["data"])[];
  itemMessages: ((file: ImportedEntry<T>) => ParserItemMessages) | ParserItemMessages;
  createData: (file: ImportedEntry<T>, tree: ReturnType<typeof logTree>) => T["data"];
  postMortem?: (items: T[]) => T[];
}): (files: ImportedEntry<T>[], base?: string) => T[] {
  return (files, base) => {
    if (files.length === 0) return [];
    const tree = logTree(...options.colNames);
    let items: T[] = [];

    for (const [i, file] of Object.entries(files)) {
      let data: T["data"];
      let itemMessages = options.itemMessages;
      if (typeof itemMessages === "function") {
        itemMessages = itemMessages(file);
      }
      try {
        tree.push(
          files.filter((f) => f.name === file.name).length > 1
            ? `${file.name} \x1b[2m(${relative(base ?? "", file.path)})\x1b[22m`
            : file.name,
          ...(itemMessages.cols ?? []),
        );
        data = options.createData(file, tree);
        const hasConflict = items.some(
          (item) => options.uniqueKeys?.every((k) => data?.[k] === item.data?.[k]) ?? item.name === file.name,
        );
        if (hasConflict) {
          throw new Error(`${logger.symbols.warn} ${itemMessages.confict}`, { cause: "dressed-parsing" });
        }
        if (typeof file.exports.default !== "function") {
          throw new TypeError(`${logger.symbols.error} Every handler must export a default function, skipping`, {
            cause: "dressed-parsing",
          });
        }
      } catch (e) {
        function asideErr() {
          const prefix = Number(i) === files.length - 1 ? " " : "│";
          if (e && e instanceof Error) {
            if (e.cause === "dressed-parsing") {
              tree.aside(`${prefix} ${e.message}`);
            } else {
              tree.aside(`${prefix} ${logger.symbols.error} Failed to parse ${file.path}: ${e.message}`);
              tree.aside(e);
            }
          }
        }
        asideErr();
        tree.chop();
        continue;
      }
      items.push({ name: file.name, data, exports: file.exports } as T);
    }

    if (options.postMortem) items = options.postMortem(items);

    tree.log();

    return items;
  };
}
