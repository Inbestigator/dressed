import { relative } from "node:path";
import type { BaseData } from "dressed/server";
import { logger } from "dressed/utils";
import type { WalkEntry } from "../../types/walk.ts";
import logTree from "../log-tree.ts";

interface ParserItemMessages {
  confict: string;
  cols?: string[];
}

type ImportedEntry<T extends BaseData> = WalkEntry & { exports: T["exports"] };
type EntriesAnd<T> = (WalkEntry & T)[];
type BDWithData<T> = BaseData & { data?: T };

export function createHandlerParser<T extends BDWithData<Record<keyof T["data"], unknown> | undefined>>(options: {
  colNames: string[];
  uniqueKeys?: (keyof T["data"])[];
  itemMessages: ((file: ImportedEntry<T>, base: string) => ParserItemMessages) | ParserItemMessages;
  createData: (file: ImportedEntry<T>, base: string, tree: ReturnType<typeof logTree>) => T["data"];
  postMortem?: (items: EntriesAnd<T>) => EntriesAnd<T>;
}): (files: ImportedEntry<T>[], base: string | string[]) => EntriesAnd<T> {
  return (files, base) => {
    if (files.length === 0) return [];
    const tree = logTree(...options.colNames);
    let items: EntriesAnd<T> = [];

    for (const [i, file] of Object.entries(files)) {
      let data: T["data"];
      let itemMessages = options.itemMessages;

      const usedBase = Array.isArray(base) ? base.find((b) => file.path.startsWith(b)) : base;

      if (!usedBase) {
        throw new TypeError(`${logger.symbols.error} Couldn't figure out where the handler comes from`, {
          cause: "dressed-parsing",
        });
      }

      if (typeof itemMessages === "function") {
        itemMessages = itemMessages(file, usedBase);
      }

      try {
        tree.push(
          files.filter((f) => f.name === file.name).length > 1
            ? `${file.name} \x1b[2m(${relative(Array.isArray(base) ? (base.at(-1) ?? "") : base, file.path)})\x1b[22m`
            : file.name,
          ...(itemMessages.cols ?? []),
        );
        data = options.createData(file, usedBase, tree);
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
      items.push({ ...file, data } as EntriesAnd<T>[number]);
    }

    if (options.postMortem) items = options.postMortem(items);

    tree.log();

    return items;
  };
}
