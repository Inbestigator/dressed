import { baseInteractionMethods } from "./responses.ts";
import type {
  APIChatInputApplicationCommandInteractionData,
  APIInteraction,
} from "discord-api-types/v10";
import type {
  CommandAutocompleteInteraction,
  CommandInteraction,
  Interaction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "../../types/interaction.ts";
import { InteractionType } from "discord-api-types/v10";
import { getOption } from "./options.ts";
import { getField } from "./fields.ts";

export function createInteraction<T extends APIInteraction>(
  input: T,
): Interaction<T> {
  if (!input.user && input.member) {
    input.user = input.member.user;
  }

  switch (input.type) {
    case InteractionType.ApplicationCommand: {
      return {
        ...input,
        ...baseInteractionMethods(input),
        getOption: (n, r) =>
          getOption(
            n,
            r ?? false,
            "options" in input.data ? (input.data.options ?? []) : [],
            (input.data as APIChatInputApplicationCommandInteractionData)
              .resolved,
          ),
      } as CommandInteraction as Interaction<T>;
    }
    case InteractionType.ApplicationCommandAutocomplete: {
      return {
        ...input,
        ...baseInteractionMethods(input),
        getOption: (n) =>
          getOption(n, false, input.data.options, input.data.resolved),
      } as CommandAutocompleteInteraction as Interaction<T>;
    }
    case InteractionType.MessageComponent: {
      return {
        ...input,
        ...baseInteractionMethods(input),
      } as MessageComponentInteraction as Interaction<T>;
    }
    case InteractionType.ModalSubmit: {
      return {
        ...input,
        ...baseInteractionMethods(input),
        getField: (c, r) =>
          getField(
            c,
            r ?? false,
            input.data.components.flatMap((c) =>
              c.type === 1 ? c.components : c.component,
            ),
            // @ts-expect-error Valid
            input.data.resolved,
          ),
      } as ModalSubmitInteraction as Interaction<T>;
    }
    default: {
      return null as Interaction<T>;
    }
  }
}
