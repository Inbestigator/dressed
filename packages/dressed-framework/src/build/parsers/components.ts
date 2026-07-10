import { relative, sep } from "node:path";
import { patternToRegex, scorePattern } from "@dressed/matcher";
import type { ComponentData, setupComponents } from "dressed/server";
import { logger } from "dressed/utils";
import type { WalkEntry } from "../../types/walk.ts";
import { createHandlerParser } from "./index.ts";

type Data = ComponentData & WalkEntry & { score: number };
type Out = Record<keyof Parameters<typeof setupComponents>[0], Record<string, Data>>;

export const parseComponents: ReturnType<typeof createHandlerParser<Data, Out, "pattern" | "default">> =
  createHandlerParser({
    colNames: ["Component", "Category"],
    itemMessages({ name, path }, base) {
      const category = getCategory(path, base);
      return {
        confict: `"${name}" conflicts with another ${category?.slice(0, -1) ?? "handler"}, skipping`,
        cols: [category ?? ""],
      };
    },
    createData({ name, path, exports: { pattern = name } = {} }, base) {
      const category = getCategory(path, base);

      if (!category) {
        throw new Error(`${logger.symbols.warn} Category for "${name}" could not be determined, skipping`, {
          cause: "dressed-parsing",
        });
      }

      const { source } = pattern instanceof RegExp ? pattern : patternToRegex(pattern);

      return [[category, source], { name, score: scorePattern(source) }];
    },
    postMortem: (items) =>
      Object.fromEntries(
        Object.entries(items).map(([key, collection]) => [
          key,
          Object.fromEntries(Object.entries(collection).sort((a, b) => b[1].score - a[1].score)),
        ]),
      ) as Out,
  });

const validComponentCategories = new Set(["buttons", "modals", "selects"] as const);

function getCategory(path: string, base: string) {
  const relativePath = relative(base, path);

  if (relativePath.startsWith("..")) return null;

  const category = relativePath.split(sep)[0] as Parameters<(typeof validComponentCategories)["has"]>[0];

  if (validComponentCategories.has(category)) return category;

  return null;
}
