import { baseInteractionMethods } from "./responses.ts";
import type {
  APIChatInputApplicationCommandInteractionData,
  APIInteraction,
} from "discord-api-types/v10";
import type { Interaction } from "../../types/interaction.ts";
import { InteractionType } from "discord-api-types/v10";
import { getOption } from "./options.ts";

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
        getOption: (name: string, required: boolean) =>
          getOption(
            name,
            required,
            "options" in interaction.data
              ? (interaction.data.options ?? [])
              : [],
            (interaction.data as APIChatInputApplicationCommandInteractionData)
              .resolved,
          ),
      } as unknown as Interaction<T>;
    }
    case InteractionType.ApplicationCommandAutocomplete: {
      return {
        ...interaction,
        ...baseInteractionMethods(interaction),
        getOption: (name: string) =>
          getOption(
            name,
            false,
            "options" in interaction.data
              ? (interaction.data.options ?? [])
              : [],
            interaction.data.resolved,
          ),
      } as unknown as Interaction<T>;
    }
    case InteractionType.MessageComponent: {
      return {
        ...interaction,
        ...baseInteractionMethods(interaction),
      } as unknown as Interaction<T>;
    }
    case InteractionType.ModalSubmit: {
      return {
        ...interaction,
        ...baseInteractionMethods(interaction),
        getField(custom_id: string, required: boolean) {
          const field = interaction.data.components
            .flatMap((c) => c.components)
            .find((c) => c.custom_id === custom_id);

          if (!field) {
            if (required) throw new Error(`Field "${name}" not found`);
            return;
          }

          return field.value;
        },
      } as unknown as Interaction<T>;
    }
    default: {
      return null as Interaction<T>;
    }
  }
}
