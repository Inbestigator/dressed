import type {
  Component,
  ComponentHandler,
} from "../../internal/types/config.ts";
import { join, normalize } from "node:path";
import type {
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "../../internal/types/interaction.ts";
import { ComponentType, InteractionType } from "discord-api-types/v10";
import { trackParts, type WalkEntry } from "../build.ts";
import { cwd } from "node:process";
import { runtime } from "std-env";
import ora from "ora";

/**
 * @returns A function that runs a component
 */
export default function setupComponents(
  components: Component[],
): ComponentHandler {
  return async function runComponent(
    interaction: MessageComponentInteraction | ModalSubmitInteraction,
  ) {
    const category = getCategory();

    function getCategory() {
      if (interaction.type === InteractionType.ModalSubmit) {
        return "modals";
      }
      switch (
        interaction.data.component_type
      ) {
        case ComponentType.Button:
          return "buttons";
        case ComponentType.ChannelSelect:
        case ComponentType.RoleSelect:
        case ComponentType.UserSelect:
        case ComponentType.StringSelect:
        case ComponentType.MentionableSelect:
          return "selects";
      }
    }

    const component = components.find(
      (c) =>
        c.category === category &&
        handleArgs(c.name).regex.test(interaction.data.custom_id),
    );

    if (!component) {
      ora(`Component "${interaction.data.custom_id}" not found`).warn();
      return;
    }

    const { regex, argNames } = handleArgs(component.name);
    const matches = regex.exec(interaction.data.custom_id);

    const args: Record<string, string> = {};

    if (matches) {
      argNames.forEach((argName, i) => {
        args[argName] = matches[i + 1];
      });
    }

    const componentLoader = ora(
      `Running component "${component.name}"${
        Object.keys(args).length > 0
          ? " with args: " + JSON.stringify(args)
          : ""
      }`,
    ).start();

    try {
      const componentModule = (await import(
        (runtime !== "bun" ? "file:" : "") +
          normalize(join(cwd(), component.path))
      )) as {
        default: ComponentHandler;
      };
      await Promise.resolve(componentModule.default(interaction, args));
      componentLoader.succeed();
    } catch (error) {
      componentLoader.fail();
      console.error("└", error);
    }
  };
}

export function handleArgs(str: string) {
  const argNames = [...str.matchAll(/\[(.+?)\]/g)].map((m) => m[1]);
  argNames.forEach((arg) => {
    str = str.replace(`[${arg}]`, "(.+)");
  });
  return { regex: new RegExp(`^${str}$`), argNames };
}

const validComponentCategories = ["buttons", "modals", "selects"];

export function parseComponents(componentFiles: WalkEntry[]) {
  const generatingLoader = ora("Generating components").start();
  const { addRow, removeN, log } = trackParts(
    "Component",
    componentFiles.length,
  );
  try {
    const componentData: Component[] = [];

    for (const file of componentFiles) {
      removeN();

      const category = file.path.split(/[\\\/]/)[2];

      if (!validComponentCategories.includes(category)) {
        ora(
          `Category for "${file.name}" could not be determined, skipping`,
        ).warn();
        continue;
      }

      const component: Component = {
        name: file.name,
        category: category as "buttons" | "modals" | "selects",
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
      addRow(`${component.name} (${category.slice(0, -1)})`);
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
