import { relative } from "node:path";
import type { BaseData } from "dressed/server";
import { logger } from "dressed/utils";
import type { WalkEntry } from "../../types/walk.ts";
import logTree from "../log-tree.ts";

interface ParserItemMessages {
  confict: string;
  cols?: string[];
}

type ImportedEntry<T extends Record<string, unknown>> = WalkEntry & { exports: T };

export function createHandlerParser<
  T extends BaseData<CallableFunction>,
  Out extends Record<string, unknown> | Record<string, Record<string, unknown>>,
  Exports extends keyof T,
  D = Omit<T, Exports>,
>(options: {
  colNames: string[];
  itemMessages: ((file: ImportedEntry<Pick<T, Exports>>, base: string) => ParserItemMessages) | ParserItemMessages;
  createData: (file: ImportedEntry<Pick<T, Exports>>, base: string, tree: ReturnType<typeof logTree>) => [string[], D];
  postMortem?: (items: Partial<Out>) => Out;
}): (files: ImportedEntry<Pick<T, Exports>>[], base: string | string[]) => Out {
  return (files, base) => {
    if (files.length === 0) return {} as Out;
    const tree = logTree(...options.colNames);
    let items: Partial<Out> = {};

    const filesArray = Object.entries(files);

    for (const [i, file] of filesArray) {
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
        const [keys, data] = options.createData(file, usedBase, tree);
        const hasConflict = Object.entries(items).some(([key, item]) =>
          keys?.every((k, i) => (i === 0 ? key === k : item[k])),
        );
        if (hasConflict) {
          throw new Error(`${logger.symbols.warn} ${itemMessages.confict}`, { cause: "dressed-parsing" });
        }
        if (!("default" in file.exports) || typeof file.exports.default !== "function") {
          throw new TypeError(`${logger.symbols.error} Every handler must export a default function, skipping`, {
            cause: "dressed-parsing",
          });
        }
        const value = { ...file, ...file.exports, ...data } as T;
        // @ts-expect-error The type specifies the structure but isn't visible to this fn
        items[keys[0]] ??= {};
        // @ts-expect-error
        if (keys.length === 1) items[keys[0]] = value;
        // @ts-expect-error
        else items[keys[0]][keys[1]] = value;
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
      }
    }

    if (options.postMortem) items = options.postMortem(items);

    tree.log();

    return items as Out;
  };
}
