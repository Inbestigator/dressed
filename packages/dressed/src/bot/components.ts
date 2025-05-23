import { basename, dirname } from "node:path";
import type { ComponentData, ComponentHandler } from "../types/config.ts";
import { trackParts, type WalkEntry } from "../build.ts";
import ora from "ora";
import { stdout } from "node:process";
import importUserFile from "../server/import.ts";
import { logRunnerError } from "./utils.ts";
import { patternToRegex, scorePattern, matchOptimal } from "@dressed/matcher";

/**
 * Creates the component handler
 * @returns A function that runs a component
 */
export function setupComponents(components: ComponentData[]): ComponentHandler {
  return async function runComponent(interaction) {
    const category = getCategory();

    function getCategory() {
      if (interaction.type === 5) {
        return "modals";
      }
      switch (interaction.data.component_type) {
        case 2:
          return "buttons";
        default:
          return "selects";
      }
    }

    const categoryComponents = components.filter(
      (c) => c.category === category,
    );

    const { index, match } = matchOptimal(
      interaction.data.custom_id,
      categoryComponents.map((c) => new RegExp(c.regex)),
    );

    if (index === -1 || !match) {
      ora(`No component handler for "${interaction.data.custom_id}"`).warn();
      return;
    }

    const handler = categoryComponents[index];
    const { groups: args = {} } = match;

    const componentLoader = ora({
      stream: stdout,
      text: `Running ${category?.slice(0, -1)} "${handler.name}"${
        Object.keys(args).length > 0
          ? " with args: " + JSON.stringify(args)
          : ""
      }`,
    }).start();

    try {
      await (
        (await importUserFile(handler)) as { default: ComponentHandler }
      ).default(interaction, args);
      componentLoader.succeed();
    } catch (e) {
      logRunnerError(e, componentLoader);
    }
  };
}

const validComponentCategories = ["buttons", "modals", "selects"];

export function parseComponents(componentFiles: WalkEntry[]): ComponentData[] {
  if (componentFiles.length === 0) return [];
  const generatingLoader = ora({
    stream: stdout,
    text: "Generating components",
  }).start();
  const { addRow, log } = trackParts(
    componentFiles.length,
    "Component",
    "Category",
  );
  try {
    const componentData: ComponentData[] = [];

    for (const file of componentFiles) {
      const category = basename(dirname(file.path));

      if (!validComponentCategories.includes(category)) {
        ora(
          `Category for "${file.name}" could not be determined, skipping`,
        ).warn();
        continue;
      }

      if (
        componentData.find(
          (c) => c.name === file.name && c.category === category,
        )
      ) {
        ora(
          `"${file.name}" conflicts with another ${category.slice(0, -1)}, skipping the duplicate`,
        ).warn();
        continue;
      }

      const component = {
        name: file.name,
        path: file.path,
        category,
        regex: patternToRegex(file.name).source,
      };

      componentData.push(component);
      addRow(component.name, category.slice(0, -1));
    }

    generatingLoader.succeed(
      componentData.length > 0 ? "Generated components" : "No components found",
    );

    if (componentData.length > 0) {
      log();
    }

    return componentData.sort(
      (a, b) => scorePattern(b.name) - scorePattern(a.name),
    );
  } catch (e) {
    generatingLoader.fail();
    throw e;
  }
}
