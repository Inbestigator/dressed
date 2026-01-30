import {
  type APIInteraction,
  ApplicationCommandType,
  ComponentType,
  InteractionType,
  type ModalSubmitComponent,
} from "discord-api-types/v10";
import type {
  CommandInteraction,
  Interaction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "../../types/interaction.ts";
import { getField } from "./fields.ts";
import { parseOptions } from "./options.ts";
import { baseInteractionMethods } from "./responses.ts";
import { parseValues } from "./values.ts";

export function createInteraction<T extends APIInteraction>(input: T): Interaction<T> {
  const methods = baseInteractionMethods(input);

  switch (input.type) {
    case InteractionType.ApplicationCommand:
    case InteractionType.ApplicationCommandAutocomplete: {
      switch (input.data.type) {
        case ApplicationCommandType.ChatInput:
          // @ts-expect-error Property is on return type
          input.options = parseOptions(input.data.options, input.data.resolved);
          break;
        case ApplicationCommandType.User:
          // @ts-expect-error Property is on return type
          input.target = {
            ...input.data.resolved.users[input.data.target_id],
            member: input.data.resolved.members?.[input.data.target_id],
          };
          break;
        case ApplicationCommandType.Message:
          // @ts-expect-error Property is on return type
          input.target = data.resolved.messages[input.data.target_id];
      }
      return { ...input, ...methods } as CommandInteraction<keyof typeof ApplicationCommandType> as Interaction<T>;
    }
    case InteractionType.MessageComponent: {
      return { ...input, ...methods, values: parseValues(input) } as MessageComponentInteraction as Interaction<T>;
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
