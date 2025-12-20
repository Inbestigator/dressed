import { isMessageComponentSelectMenuInteraction } from "discord-api-types/utils";
import type {
  APIChatInputApplicationCommandInteractionData,
  APIInteraction,
  APIInteractionDataResolved,
  ModalSubmitComponent,
} from "discord-api-types/v10";
import { ApplicationCommandType, ComponentType, InteractionType } from "discord-api-types/v10";
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

  switch (input.type) {
    case InteractionType.ApplicationCommand: {
      const { data } = input;
      switch (data.type) {
        case ApplicationCommandType.Message:
          // @ts-expect-error Property is on return type
          input.target = data.resolved.messages[data.target_id];
          break;
        case ApplicationCommandType.User:
          // @ts-expect-error Property is on return type
          input.target = { ...data.resolved.users[data.target_id], member: data.resolved.members?.[data.target_id] };
      }
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
      return {
        ...input,
        ...methods,
        getValues: () => {
          if (!isMessageComponentSelectMenuInteraction(input)) {
            throw new Error("The getValues function may only be used on select menus");
          }

          const resolved: Partial<APIInteractionDataResolved> = "resolved" in input.data ? input.data.resolved : {};
          const returnValues = (resolvedKey: keyof APIInteractionDataResolved) => {
            if (!resolved?.[resolvedKey]) {
              throw new Error(`No ${resolvedKey} found`);
            }
            return input.data.values.map((v) => resolved[resolvedKey]?.[v]);
          };

          switch (input.data.component_type) {
            case ComponentType.StringSelect:
              return input.data.values;
            case ComponentType.UserSelect:
              return returnValues("users");
            case ComponentType.RoleSelect:
              return returnValues("roles");
            case ComponentType.MentionableSelect: {
              if (!resolved?.users && !resolved?.roles) {
                throw new Error(`No mentionables found`);
              }
              const mentionables = [];
              for (const value of input.data.values) {
                mentionables.push(resolved.users?.[value] ?? resolved.roles?.[value]);
              }
              return mentionables;
            }
            case ComponentType.ChannelSelect:
              return returnValues("channels");
          }
        },
      } as MessageComponentInteraction as Interaction<T>;
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
