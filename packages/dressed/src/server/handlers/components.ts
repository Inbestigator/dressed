import type { ComponentData } from "../../types/config.ts";
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
export const setupComponents: ReturnType<
  typeof createHandlerSetup<ComponentData, Data, [Data, Record<string, string>]>
> = createHandlerSetup({
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
  findItem(interaction, items) {
    const category = getCategory(interaction);
    for (const item of items) {
      if (item.data.category !== category) continue;
      const match = new RegExp(item.data.regex).exec(interaction.data.custom_id);
      if (match) return [item, [interaction, match.groups ?? {}]];
    }
  },
});
