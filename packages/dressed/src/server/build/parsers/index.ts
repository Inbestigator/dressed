import { trackParts } from "../parts.ts";
import type { WalkEntry } from "../../../types/walk.ts";
import type { BaseData } from "../../../types/config.ts";
import ora from "ora";
import { stdout } from "node:process";
import bundleFile from "../bundle.ts";

interface ParserMessages {
  pending: string;
  generated: string;
  noItems: string;
}

interface ParserItemMessages {
  confict: string;
  col2?: string;
}

export function createHandlerParser<T>(options: {
  col1Name: string;
  col2Name?: string;
  uniqueKeys?: (keyof T)[];
  messages: ParserMessages;
  itemMessages: ((file: WalkEntry) => ParserItemMessages) | ParserItemMessages;
  createData: (file: WalkEntry) => Promise<T> | T;
}): (files: WalkEntry[]) => Promise<BaseData<T>[]> {
  return async (files: WalkEntry[]) => {
    if (files.length === 0) return [];
    const generatingLoader = ora({
      stream: stdout,
      text: options.messages.pending,
    }).start();
    const { addRow, log } = trackParts(
      files.length,
      options.col1Name,
      options.col2Name,
    );

    try {
      const items: BaseData<T>[] = [];

      for (const file of files) {
        let data: T;

        try {
          if (typeof options.itemMessages === "function") {
            options.itemMessages = options.itemMessages(file);
          }
          await bundleFile(file);
          data = await options.createData(file);
          const hasConflict = items.some((c) => {
            if (c.name !== file.name) return false;
            return options.uniqueKeys?.every((k) => data[k] === c.data[k]);
          });
          if (hasConflict) {
            ora(options.itemMessages.confict).warn();
            throw null;
          }
        } catch {
          continue;
        }

        const item: BaseData<T> = {
          name: file.name,
          path: file.path,
          data,
          uid: crypto.randomUUID().split("-")[0],
        };

        items.push(item);
        addRow(file.name, options.itemMessages.col2);
      }

      generatingLoader.succeed(
        items.length > 0
          ? options.messages.generated
          : options.messages.noItems,
      );

      if (items.length > 0) {
        log();
      }

      return items;
    } catch (e) {
      generatingLoader.fail();
      throw e;
    }
  };
}
