import { relative, sep } from "node:path";
import { patternToRegex } from "@dressed/matcher";
import type { ComponentData, setupComponents } from "dressed/server";
import { logger } from "dressed/utils";
import type { WalkEntry } from "../../types/walk.ts";
import { createHandlerParser } from "./index.ts";

type Data = ComponentData & WalkEntry & { score: number };
type Out = { [K in keyof Parameters<typeof setupComponents>[0]]: Record<string, Data> };

export const parseComponents: ReturnType<typeof createHandlerParser<Data, Out, "default" | "pattern">> =
  createHandlerParser({
    colNames: ["Component", "Category"],
    itemMessages({ name, path }, base) {
      const category = getCategory(path, base);
      return {
        confict: `"${name}" conflicts with another ${category?.slice(0, -1) ?? "handler"}, skipping`,
        cols: [category ?? ""],
      };
    },
    createData({ name, path, pattern = name }, base) {
      const category = getCategory(path, base);

      if (!category) {
        throw new Error(`${logger.symbols.warn} Category for "${name}" could not be determined, skipping`, {
          cause: "dressed-parsing",
        });
      }

      const { source } = pattern instanceof RegExp ? pattern : patternToRegex(pattern);

      return [[category, source], { name, score: scoreSource(source) }];
    },
    postMortem: (items) =>
      Object.fromEntries(
        Object.entries(items).map(([key, collection]) => [
          key,
          Object.fromEntries(Object.entries(collection).sort((a, b) => b[1].score - a[1].score)),
        ]),
      ) as Out,
    desiredExports: ["default"],
  });

const validComponentCategories = new Set(["buttons", "modals", "selects"] as const);

function getCategory(path: string, base: string) {
  const relativePath = relative(base, path);

  if (relativePath.startsWith("..")) return null;

  const category = relativePath.split(sep)[0] as Parameters<(typeof validComponentCategories)["has"]>[0];

  if (validComponentCategories.has(category)) return category;

  return null;
}

function scoreSource(source: string) {
  let literal = 0;
  let dynamic = 0;

  for (let i = 0; i < source.length; i++) {
    const c = source[i];

    if (c === "\\") {
      ++literal;
      ++i;
      continue;
    }

    if (/^[a-zA-Z0-9/_-]$/.test(c)) {
      ++literal;
      continue;
    }

    switch (c) {
      case ".":
        dynamic += 3;
        break;
      case "*":
      case "+":
      case "?":
        dynamic += 2;
        break;
      case "[":
      case "(":
      case "{":
      case "|":
        dynamic += 1;
        break;
    }
  }

  if (source.startsWith("^")) literal += 2;
  if (source.endsWith("$")) literal += 2;

  return literal / Math.max(1, literal + dynamic);
}
