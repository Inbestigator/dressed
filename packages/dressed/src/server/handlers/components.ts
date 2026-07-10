import type { Category, ComponentData } from "../../types/config.ts";
import type { ComponentInteraction, ModalInteraction } from "../../types/interaction.ts";
import { createHandlerSetup } from "./index.ts";

type Data = ComponentInteraction | ModalInteraction;

function getCategory(interaction: Data) {
  if (interaction.type === 5) return "modals";
  return interaction.data.component_type === 2 ? "buttons" : "selects";
}

/**
 * Creates the component handler
 * @returns A function that runs a component
 */
export const setupComponents = createHandlerSetup<
  ComponentData<Category>,
  Data,
  [Data, Record<string, string>],
  { [K in Category]?: Record<string, ComponentData<K>> }
>({
  itemMessages(interaction) {
    const category = getCategory(interaction).slice(0, -1);
    return {
      noItem: `No ${category} component handler for "${interaction.data.custom_id}"`,
      pending(item, props) {
        const withArgs = ` with args: ${JSON.stringify(props[1])}`;
        return `Running ${category} "${item.name}"${Object.keys(props[1]).length > 0 ? withArgs : ""}`;
      },
    };
  },
  findItem(interaction, items, key) {
    const category = getCategory(interaction);
    for (const [regex, item] of Object.entries(items[category] ?? {})) {
      const match = new RegExp(regex).exec(interaction.data.custom_id);
      if (match) return [item, item[key], [interaction, match.groups ?? {}]];
    }
  },
});
