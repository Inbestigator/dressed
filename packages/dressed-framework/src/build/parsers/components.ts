import { relative, sep } from "node:path";
import { patternToRegex, scorePattern } from "@dressed/matcher";
import type { ComponentData } from "dressed/server";
import { logger } from "dressed/utils";
import { createHandlerParser } from "./index.ts";

export const parseComponents: ReturnType<typeof createHandlerParser<ComponentData & { data: { score: number } }>> =
  createHandlerParser({
    colNames: ["Component", "Category"],
    uniqueKeys: ["category", "regex"],
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

      return { category, regex: source, score: scorePattern(source) };
    },
    postMortem: (c) => c.sort((a, b) => b.data.score - a.data.score),
  });

const validComponentCategories = new Set(["buttons", "modals", "selects"]);

function getCategory(path: string, base: string) {
  const relativePath = relative(base, path);

  if (relativePath.startsWith("..")) return null;

  const category = relativePath.split(sep)[0];

  if (validComponentCategories.has(category)) return category as ComponentData["data"]["category"];

  return null;
}
