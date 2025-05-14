import { baseInteractionMethods } from "./responses.ts";
import type { Interaction } from "../types/interaction.ts";
import type {
  APIChatInputApplicationCommandInteractionData,
  APIInteraction,
} from "discord-api-types/v10";
import { InteractionType } from "discord-api-types/v10";
import { getOption } from "./options.ts";

export default function createInteraction<T extends APIInteraction>(
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
        getOption: <Required extends boolean>(
          name: string,
          required: Required,
        ) =>
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
        getField: <Required extends boolean>(
          name: string,
          required: Required,
        ) => {
          const field = interaction.data.components
            .map((c) => c.components)
            .flat()
            .find((c) => c.custom_id === name);

          if (!field) {
            if (required) throw new Error(`Field "${name}" not found`);
            return null;
          }

          return field.value;
        },
      } as unknown as Interaction<T>;
    }
    default: {
      return null as unknown as Interaction<T>;
    }
  }
}
