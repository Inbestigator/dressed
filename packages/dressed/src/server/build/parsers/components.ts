import { sep } from "node:path";
import { patternToRegex, scorePattern } from "@dressed/matcher";
import type { ComponentData } from "../../../types/config.ts";
import { warnSymbol } from "../../../utils/log.ts";
import { createHandlerParser } from "./index.ts";

const validComponentCategories = ["buttons", "modals", "selects"];

export const parseComponents: ReturnType<typeof createHandlerParser<ComponentData>> = createHandlerParser({
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
      throw `${warnSymbol} Category for "${name}" could not be determined, skipping`;
    }

    return {
      category,
      ...(pattern instanceof RegExp
        ? {
            regex: pattern.source,
            score: scorePattern(pattern.source),
          }
        : {
            regex: patternToRegex(pattern).source,
            score: scorePattern(pattern),
          }),
    };
  },
  postMortem: (c) => c.sort((a, b) => b.data.score - a.data.score),
});

function getCategory(path: string) {
  const parts = path.split(sep);

  const compIndex = parts.lastIndexOf("components");
  if (compIndex === -1) return null;

  for (let i = parts.length - 2; i > compIndex; i--) {
    if (validComponentCategories.includes(parts[i])) {
      return parts[i];
    }
  }

  return null;
}
