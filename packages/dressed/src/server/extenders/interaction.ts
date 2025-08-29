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
  interaction: T,
): Interaction<T> {
  if (!interaction.user && interaction.member) {
    interaction.user = interaction.member.user;
  }

  switch (interaction.type) {
    case InteractionType.ApplicationCommand: {
      return {
        ...interaction,
        ...baseInteractionMethods(interaction),
        getOption: (n, r) =>
          getOption(
            n,
            r ?? false,
            "options" in interaction.data
              ? (interaction.data.options ?? [])
              : [],
            (interaction.data as APIChatInputApplicationCommandInteractionData)
              .resolved,
          ),
      } as CommandInteraction as Interaction<T>;
    }
    case InteractionType.ApplicationCommandAutocomplete: {
      return {
        ...interaction,
        ...baseInteractionMethods(interaction),
        getOption: (n) =>
          getOption(
            n,
            false,
            interaction.data.options,
            interaction.data.resolved,
          ),
      } as CommandAutocompleteInteraction as Interaction<T>;
    }
    case InteractionType.MessageComponent: {
      return {
        ...interaction,
        ...baseInteractionMethods(interaction),
      } as MessageComponentInteraction as Interaction<T>;
    }
    case InteractionType.ModalSubmit: {
      return {
        ...interaction,
        ...baseInteractionMethods(interaction),
        getField: (c, r) =>
          getField(
            c,
            r ?? false,
            interaction.data.components.flatMap((c) =>
              c.type === 1 ? c.components : c.component,
            ),
          ),
      } as ModalSubmitInteraction as Interaction<T>;
    }
    default: {
      return null as Interaction<T>;
    }
  }
}
