import logTree from "../log-tree.ts";
import type { WalkEntry } from "../../../types/walk.ts";
import ora from "ora";
import { stdout } from "node:process";
import type { Promisable } from "../../../types/utilities.ts";
import type { BaseData } from "../../../types/config.ts";

interface ParserMessages {
  pending: string;
  generated: string;
  noItems: string;
}

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
  messages: ParserMessages;
  itemMessages: ((file: F) => ParserItemMessages) | ParserItemMessages;
  createData: (file: F) => Promisable<T["data"]>;
  postMortem?: (items: T[]) => Promisable<T[]>;
}): (files: F[]) => Promise<T[]> {
  return async (files) => {
    if (files.length === 0) return [];
    const generatingLoader = ora({
      stream: stdout,
      text: options.messages.pending,
    }).start();
    const tree = logTree(files.length, options.col1Name, options.col2Name);

    try {
      let items: T[] = [];

      for (const file of files) {
        let data: T["data"];
        let itemMessages = options.itemMessages;

        try {
          if (typeof itemMessages === "function") {
            itemMessages = itemMessages(file);
          }
          data = await options.createData(file);
          const hasConflict = items.some((c) => {
            if (c.name !== file.name) return false;
            return options.uniqueKeys?.every((k) => data[k] === c.data[k]);
          });
          if (hasConflict) {
            ora(itemMessages.confict).warn();
            throw null;
          }

          items.push({
            name: file.name,
            path: file.path,
            uid: file.uid,
            data,
            exports: null,
          } as T);
          tree.push(file.name, itemMessages.col2);
        } catch (e) {
          if (e && e instanceof Error) {
            ora(`Failed to parse ${file.path}:`).fail();
            console.error(e);
          }
          continue;
        }
      }

      if (options.postMortem) {
        items = await options.postMortem(items);
      }

      generatingLoader.succeed(
        items.length > 0
          ? options.messages.generated
          : options.messages.noItems,
      );

      if (items.length > 0) {
        tree.log();
      }

      return items;
    } catch (e) {
      generatingLoader.fail();
      throw e;
    }
  };
}
