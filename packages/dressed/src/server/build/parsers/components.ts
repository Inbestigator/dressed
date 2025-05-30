import { sep } from "node:path";
import type { ComponentData } from "../../../types/config.ts";
import ora from "ora";
import { patternToRegex, scorePattern } from "@dressed/matcher";
import { createHandlerParser } from "./index.ts";

const validComponentCategories = ["buttons", "modals", "selects"];

export const parseComponents = createHandlerParser<ComponentData>({
  col1Name: "Component",
  col2Name: "Category",
  messages: {
    pending: "Generating components",
    generated: "Generated components",
    noItems: "No components found",
  },
  uniqueKeys: ["category"],
  itemMessages({ name, path }) {
    const category = getCategory(path);
    return {
      confict: `"${name}" conflicts with another ${category?.slice(0, -1)}, skipping the duplicate`,
      col2: category ?? "unknown",
    };
  },
  async createData({ name, path, originalPath }) {
    const { pattern = name } = await import(path);
    const category = getCategory(originalPath);

    if (!category) {
      ora(`Category for "${name}" could not be determined, skipping`).warn();
      throw null;
    }

    return {
      category,
      regex: patternToRegex(pattern).source,
      score: scorePattern(pattern),
    };
  },
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
