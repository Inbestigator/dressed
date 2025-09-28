import { relative } from "node:path";
import type { BaseData } from "../../../types/config.ts";
import type { WalkEntry } from "../../../types/walk.ts";
import { errorSymbol, warnSymbol } from "../../../utils/log.ts";
import logTree from "../log-tree.ts";

interface ParserItemMessages {
  confict: string;
  col2?: string;
}

export function createHandlerParser<
  T extends BaseData<Partial<Record<keyof T["data"], unknown>>>,
  F extends WalkEntry = WalkEntry & { exports?: NonNullable<T["exports"]> },
>(options: {
  col1Name: string;
  col2Name?: string;
  uniqueKeys?: (keyof T["data"])[];
  itemMessages: ((file: F) => ParserItemMessages) | ParserItemMessages;
  createData: (file: F, tree: ReturnType<typeof logTree>) => T["data"];
  postMortem?: (items: T[]) => T[];
}): (files: F[], base?: string) => T[] {
  return (files, base) => {
    if (files.length === 0) return [];
    const tree = logTree(files.length, options.col1Name, options.col2Name);
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
          itemMessages.col2,
        );
        data = options.createData(file, tree);
        const hasConflict = items.some(
          (item) => options.uniqueKeys?.every((k) => data[k] === item.data[k]) ?? item.name === file.name,
        );
        if (hasConflict) {
          throw `${warnSymbol} ${itemMessages.confict}`;
        }
        // @ts-expect-error Technically, type F should extend `& { default: AnyFn }`. Shouldn't skip if exports aren't even included
        if ("exports" in file && typeof file.exports.default !== "function") {
          throw `${errorSymbol} Every handler must export a default function, skipping`;
        }
      } catch (e) {
        const prefix = Number(i) !== files.length - 1 ? "│" : " ";
        if (e && e instanceof Error) {
          tree.aside(`${prefix} ${errorSymbol} Failed to parse ${file.path}: ${e.message}`);
          tree.aside(e);
        } else if (typeof e === "string") {
          tree.aside(`${prefix} ${e}`);
        }
        tree.chop();
        continue;
      }
      items.push({
        name: file.name,
        path: file.path,
        uid: file.uid,
        data,
        exports: null,
      } as T);
    }

    if (options.postMortem) {
      items = options.postMortem(items);
    }

    tree.log();

    return items;
  };
}
