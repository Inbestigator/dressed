import { sep } from "node:path";
import { patternToRegex, scorePattern } from "@dressed/matcher";
import type { ComponentData } from "dressed/server";
import { logger } from "dressed/utils";
import { createHandlerParser } from "./index.ts";

export const parseComponents: ReturnType<typeof createHandlerParser<ComponentData & { data: { score: number } }>> =
  createHandlerParser({
    colNames: ["Component", "Category"],
    uniqueKeys: ["category", "regex"],
    itemMessages({ name, path }) {
      const category = getCategory(path);
      return {
        confict: `"${name}" conflicts with another ${category?.slice(0, -1)}, skipping`,
        cols: [category ?? ""],
      };
    },
    createData({ name, path, exports: { pattern = name } = {} }) {
      const category = getCategory(path);

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

function getCategory(path: string) {
  const parts = path.split(sep);

  const compIndex = parts.lastIndexOf("components");
  if (compIndex === -1) return null;

  for (let i = parts.length - 2; i > compIndex; --i) {
    if (validComponentCategories.has(parts[i])) return parts[i] as ComponentData["data"]["category"];
  }

  return null;
}
