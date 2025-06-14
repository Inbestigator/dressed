import type { ComponentData } from "../../types/config.ts";
import { matchOptimal } from "@dressed/matcher";
import { createHandlerSetup } from "./index.ts";
import type {
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "../../types/interaction.ts";

type Data = MessageComponentInteraction | ModalSubmitInteraction;

function getCategory(interaction: Data) {
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

/**
 * Creates the component handler
 * @returns A function that runs a component
 */
export const setupComponents: ReturnType<
  typeof createHandlerSetup<ComponentData, Data, [Data, Record<string, string>]>
> = createHandlerSetup({
  itemMessages: (interaction) => {
    const category = getCategory(interaction).slice(0, -1);
    return {
      noItem: `No ${category} component handler for "${interaction.data.custom_id}"`,
      middlewareKey: "components",
      pending: (item, props) =>
        `Running ${category} "${item.name}"${
          Object.keys(props[1]).length > 0
            ? " with args: " + JSON.stringify(props[1])
            : ""
        }`,
    };
  },
  findItem(interaction, items) {
    const category = getCategory(interaction);
    const categoryItems = items.filter((i) => i.data.category === category);
    const { index, match } = matchOptimal(
      interaction.data.custom_id,
      categoryItems.map((c) => new RegExp(c.data.regex)),
    );

    if (index === -1 || !match) {
      return;
    }

    const item = categoryItems[index];
    const { groups: args = {} } = match;
    return [item, [interaction, args]];
  },
});
