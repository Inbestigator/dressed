import { basename, dirname } from "node:path";
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
  itemMessages(file) {
    const category = basename(dirname(file.path)).slice(0, -1);
    return {
      confict: `"${file.name}" conflicts with another ${category}, skipping the duplicate`,
      col2: category,
    };
  },
  async createData(file) {
    const { pattern = file.name } = await import(file.path);
    const category = basename(dirname(file.path));

    if (!validComponentCategories.includes(category)) {
      ora(
        `Category for "${file.name}" could not be determined, skipping`,
      ).warn();
      throw null;
    }

    return {
      category,
      regex: patternToRegex(pattern).source,
      score: scorePattern(pattern),
    };
  },
});
