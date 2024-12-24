import type { Component } from "../../internal/types/config.ts";
import { join, normalize } from "node:path";
import { underline } from "@std/fmt/colors";
import ora from "ora";
import type {
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "../../internal/types/interaction.ts";
import { ComponentType, InteractionType } from "discord-api-types/v10";
import { fetchFiles, type WalkEntry } from "../build.ts";
import { cwd } from "node:process";
import { runtime } from "std-env";

/**
 * Fetches the components from the components directory
 *
 * @returns A function that runs a component
 */
export default async function setupComponents(
  componentFiles?: WalkEntry[],
): Promise<
  (
    interaction: MessageComponentInteraction | ModalSubmitInteraction,
  ) => Promise<void>
> {
  const generatingLoader = ora("Generating components").start();
  let generatedN = 0;
  const generatedStr: string[][] = [[underline("\nComponent")]];

  function addComponent(
    name: string,
    category: string,
    totalComponents: number,
  ) {
    generatedN++;
    generatedStr.push([
      totalComponents === 1
        ? "-"
        : generatedN === 1
        ? "┌"
        : totalComponents === generatedN
        ? "└"
        : "├",
      name + ` (${category})`,
    ]);
  }

  if (!componentFiles) componentFiles = await fetchFiles("src/components");

  try {
    const components = await parseComponents(componentFiles);

    components.forEach((component) => {
      addComponent(component.name, component.category, components.length);
    });

    generatingLoader.succeed();

    console.log(generatedStr.map((row) => row.join(" ")).join("\n"));

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
        await Promise.resolve(component.default(interaction, args));
        componentLoader.succeed();
      } catch (error) {
        componentLoader.fail();
        console.error("└", error);
      }
    };
  } catch (e) {
    generatingLoader.fail();
    throw e;
  }
}

export function handleArgs(str: string) {
  const argNames = [...str.matchAll(/\[(.+?)\]/g)].map((m) => m[1]);
  argNames.forEach((arg) => {
    str = str.replace(`[${arg}]`, "([a-zA-Z0-9_-]+?)");
  });
  return { regex: new RegExp(`^${str}$`), argNames };
}

const validComponentCategories = ["buttons", "modals", "selects"];

async function parseComponents(componentFiles: WalkEntry[]) {
  const componentData: Component[] = [];

  for (const file of componentFiles) {
    const componentModule = (await import(
      (runtime !== "bun" ? "file:" : "") + normalize(join(cwd(), file.path))
    )) as {
      config?: Component;
      default: (
        interaction: MessageComponentInteraction | ModalSubmitInteraction,
      ) => unknown;
    };

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
      default: componentModule.default,
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
  }

  return componentData;
}
