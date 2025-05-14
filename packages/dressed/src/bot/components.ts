import { basename, dirname } from "node:path";
import type {
  BuildComponent,
  Component,
  ComponentHandler,
} from "../types/config.ts";
import { trackParts, type WalkEntry } from "../build.ts";
import ora from "ora";
import { stdout } from "node:process";

/**
 * Creates the component handler
 * @returns A function that runs a component
 */
export function setupComponents(components: Component[]): ComponentHandler {
  return async function runComponent(interaction) {
    const category = getCategory();

    function getCategory() {
      if (interaction.type === 5) {
        return "modals";
      }
      switch (interaction.data.component_type) {
        case 2:
          return "buttons";
        case 8:
        case 7:
        case 6:
        case 5:
        case 3:
          return "selects";
      }
    }

    const handler = components.find((c) => {
      if (c.category !== category) return false;
      if (c.regex.startsWith("^")) {
        return new RegExp(c.regex).test(interaction.data.custom_id);
      } else {
        return c.regex === interaction.data.custom_id;
      }
    });

    if (!handler) {
      ora(`No component handler for "${interaction.data.custom_id}"`).warn();
      return;
    }

    const match = handler.regex.startsWith("^")
      ? new RegExp(handler.regex).exec(interaction.data.custom_id)
      : null;
    const args = match?.groups ?? {};

    const componentLoader = ora({
      stream: stdout,
      text: `Running component "${handler.name}"${
        Object.keys(args).length > 0
          ? " with args: " + JSON.stringify(args)
          : ""
      }`,
    }).start();

    try {
      await Promise.resolve(
        ((await handler.import()).default as ComponentHandler)(
          interaction,
          args,
        ),
      );
      componentLoader.succeed();
    } catch (error) {
      componentLoader.fail();
      console.error("└", error);
    }
  };
}

export function parseArgs(str: string) {
  if (!str.match(/\[(.+?)\]/g)) {
    return new RegExp(str);
  }
  str = str.replace(/\[(.+?)\]/g, "(?<$1>.+)");
  return new RegExp(`^${str}$`);
}

const validComponentCategories = ["buttons", "modals", "selects"];

export function parseComponents(componentFiles: WalkEntry[]) {
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
    const componentData: BuildComponent[] = [];

    for (const file of componentFiles) {
      const category = basename(dirname(file.path));

      if (!validComponentCategories.includes(category)) {
        ora(
          `Category for "${file.name}" could not be determined, skipping`,
        ).warn();
        continue;
      }

      const component: BuildComponent = {
        name: file.name,
        category: category as BuildComponent["category"],
        regex: parseArgs(file.name).source,
        path: file.path,
      };

      if (
        componentData.find(
          (c) => c.name === component.name && c.category === category,
        )
      ) {
        ora(
          `${category.slice(0, 1).toUpperCase() + category.slice(1)} component "${
            component.name
          }" already exists, skipping the duplicate`,
        ).warn();
        continue;
      }

      componentData.push(component);
      addRow(component.name, category.slice(0, -1));
    }

    generatingLoader.succeed(
      componentData.length > 0 ? "Generated components" : "No components found",
    );

    if (componentData.length > 0) {
      log();
    }

    return componentData;
  } catch (e) {
    generatingLoader.fail();
    throw e;
  }
}
