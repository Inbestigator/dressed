import type {
  APIChatInputApplicationCommandInteractionData,
  APIInteraction,
  ModalSubmitComponent,
} from "discord-api-types/v10";
import { ComponentType, InteractionType } from "discord-api-types/v10";
import type {
  CommandAutocompleteInteraction,
  CommandInteraction,
  Interaction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "../../types/interaction.ts";
import { getField } from "./fields.ts";
import { getOption } from "./options.ts";
import { baseInteractionMethods } from "./responses.ts";

export function createInteraction<T extends APIInteraction>(input: T): Interaction<T> {
  const methods = baseInteractionMethods(input);

  if (!input.user && input.member) {
    input.user = input.member.user;
  }

  switch (input.type) {
    case InteractionType.ApplicationCommand: {
      return {
        ...input,
        ...methods,
        getOption: (n, r) =>
          getOption(
            n,
            r ?? false,
            "options" in input.data ? (input.data.options ?? []) : [],
            (input.data as APIChatInputApplicationCommandInteractionData).resolved,
          ),
      } as CommandInteraction as Interaction<T>;
    }
    case InteractionType.ApplicationCommandAutocomplete: {
      return {
        ...input,
        ...methods,
        getOption: (n) => getOption(n, false, input.data.options, input.data.resolved),
      } as CommandAutocompleteInteraction as Interaction<T>;
    }
    case InteractionType.MessageComponent: {
      return { ...input, ...methods } as MessageComponentInteraction as Interaction<T>;
    }
    case InteractionType.ModalSubmit: {
      const components: ModalSubmitComponent[] = [];
      for (const component of input.data.components) {
        switch (component.type) {
          case ComponentType.ActionRow:
            components.push(...component.components);
            break;
          case ComponentType.Label:
            components.push(component.component);
            break;
          case ComponentType.TextDisplay:
            continue;
        }
      }
      return {
        ...input,
        ...methods,
        getField: (c, r) => getField(c, r ?? false, components, input.data.resolved),
      } as ModalSubmitInteraction as Interaction<T>;
    }
    default: {
      return null as Interaction<T>;
    }
  }
}
