import { normalize } from "node:path";
import type {
  BuildComponent,
  Component,
  ComponentHandler,
} from "../../internal/types/config.ts";
import type {
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "../../internal/types/interaction.ts";
import { trackParts, type WalkEntry } from "../build.ts";
import ora from "ora";

/**
 * Creates the component handler
 * @returns A function that runs a component
 */
export function setupComponents(
  components: Component[],
): ComponentHandler {
  return async function runComponent(
    interaction: MessageComponentInteraction | ModalSubmitInteraction,
  ) {
    const category = getCategory();

    function getCategory() {
      if (interaction.type === 5) {
        return "modals";
      }
      switch (
        interaction.data.component_type
      ) {
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

    const component = components.find(
      (c) => {
        if (c.category !== category) return false;
        if (c.regex.startsWith("^")) {
          return new RegExp(c.regex).test(interaction.data.custom_id);
        } else {
          return c.regex === interaction.data.custom_id;
        }
      },
    );

    if (!component) {
      ora(`Component "${interaction.data.custom_id}" not found`).warn();
      return;
    }

    const match = component.regex.startsWith("^")
      ? new RegExp(component.regex).exec(interaction.data.custom_id)
      : null;
    const args = match?.groups ?? {};

    const componentLoader = ora(
      `Running component "${component.name}"${
        Object.keys(args).length > 0
          ? " with args: " + JSON.stringify(args)
          : ""
      }`,
    ).start();

    try {
      await Promise.resolve(
        ((await component.import()).default as ComponentHandler)(
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
  str = str.replaceAll(/\[(.+?)\]/g, "(?<$1>.+)");
  return new RegExp(`^${str}$`);
}

const validComponentCategories = ["buttons", "modals", "selects"];

export function parseComponents(componentFiles: WalkEntry[], root: string) {
  const generatingLoader = ora("Generating components").start();
  const { addRow, removeN, log } = trackParts(
    componentFiles.length,
    "Component",
    "Category",
  );
  try {
    const componentData: BuildComponent[] = [];

    for (const file of componentFiles) {
      removeN();

      const category =
        file.path.split(/[\\\/]/)[normalize(root).split(/[\\\/]/).length + 1];

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
          `${
            component.category.slice(0, 1).toUpperCase() +
            component.category.split("s")[0].slice(1)
          } component "${component.name}" already exists, skipping the duplicate`,
        ).warn();
        continue;
      }

      componentData.push(component);
      addRow(component.name, category.slice(0, -1));
    }

    generatingLoader.succeed(
      componentData.length > 0 ? "Generated components" : "No components found",
    );
    componentData.length > 0 && log();

    return componentData;
  } catch (e) {
    generatingLoader.fail();
    throw e;
  }
}
