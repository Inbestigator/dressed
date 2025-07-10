import {
  type APIInteraction,
  type APIInteractionResponseCallbackData,
  type APIModalInteractionResponseCallbackData,
  InteractionResponseType,
  MessageFlags,
  Routes,
} from "discord-api-types/v10";
import type { BaseInteractionMethods } from "../../types/interaction.ts";
import { callDiscord } from "../../utils/call-discord.ts";
import { botEnv } from "../../utils/env.ts";
import type { RawFile } from "../../types/file.ts";

export const baseInteractionMethods = (
  interaction: APIInteraction,
): BaseInteractionMethods => ({
  async reply(data) {
    if (typeof data === "string") {
      data = { content: data };
    }

    if (data.ephemeral) {
      const flags = (data.flags ?? 0) | MessageFlags.Ephemeral;
      data.flags = flags;
    }

    const files = data.files;
    delete data.files;

    const res = await callDiscord(
      Routes.interactionCallback(interaction.id, interaction.token),
      {
        method: "POST",
        body: {
          type: InteractionResponseType.ChannelMessageWithSource,
          data,
        },
        params: data.with_response
          ? {
              with_response: data.with_response,
            }
          : undefined,
        files,
      },
    );
    return data.with_response ? res.json() : null;
  },
  async deferReply(data) {
    if (data?.ephemeral) {
      const flags = (data.flags ?? 0) | MessageFlags.Ephemeral;
      data.flags = flags;
    }

    const res = await callDiscord(
      Routes.interactionCallback(interaction.id, interaction.token),
      {
        method: "POST",
        body: {
          type: InteractionResponseType.DeferredChannelMessageWithSource,
          data,
        },
        params: data?.with_response
          ? {
              with_response: data.with_response,
            }
          : undefined,
      },
    );

    return data?.with_response ? res.json() : null;
  },
  async update(data) {
    if (typeof data === "string") {
      data = { content: data };
    }

    const files = data.files;
    delete data.files;

    await callDiscord(
      Routes.interactionCallback(interaction.id, interaction.token),
      {
        method: "POST",
        body: {
          type: InteractionResponseType.UpdateMessage,
          data,
        },
        files,
      },
    );
  },
  async deferUpdate() {
    await callDiscord(
      Routes.interactionCallback(interaction.id, interaction.token),
      {
        method: "POST",
        body: {
          type: InteractionResponseType.DeferredMessageUpdate,
        },
      },
    );
  },
  async editReply(data) {
    if (typeof data === "string") {
      data = { content: data };
    }

    const files = data.files;
    delete data.files;

    await callDiscord(
      Routes.webhookMessage(botEnv.DISCORD_APP_ID!, interaction.token),
      {
        method: "PATCH",
        body: data,
        files,
      },
    );
  },
  async followUp(
    data:
      | string
      | (APIInteractionResponseCallbackData & {
          files?: RawFile[];
          ephemeral?: boolean;
        }),
  ): Promise<void> {
    if (typeof data === "string") {
      data = { content: data };
    }

    if (data.ephemeral) {
      const flags = (data.flags ?? 0) | MessageFlags.Ephemeral;
      data.flags = flags;
    }

    const files = data.files;
    delete data.files;

    await callDiscord(
      Routes.webhook(botEnv.DISCORD_APP_ID!, interaction.token),
      {
        method: "POST",
        body: data,
        files,
      },
    );
  },
  async showModal(
    data: APIModalInteractionResponseCallbackData,
  ): Promise<void> {
    await callDiscord(
      Routes.interactionCallback(interaction.id, interaction.token),
      {
        method: "POST",
        body: {
          type: InteractionResponseType.Modal,
          data,
        },
      },
    );
  },
  async sendChoices(...choices) {
    await callDiscord(
      Routes.interactionCallback(interaction.id, interaction.token),
      {
        method: "POST",
        body: {
          type: InteractionResponseType.ApplicationCommandAutocompleteResult,
          data: { choices },
        },
      },
    );
  },
  user: interaction.member?.user ?? interaction.user!,
});
