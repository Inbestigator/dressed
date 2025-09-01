import {
  type APIInteraction,
  type APIInteractionResponseCallbackData,
  MessageFlags,
} from "discord-api-types/v10";
import type { BaseInteractionMethods } from "../../types/interaction.ts";
import { botEnv } from "../../utils/env.ts";
import type { RawFile } from "../../types/file.ts";
import {
  editWebhookMessage,
  executeWebhook,
} from "../../resources/webhooks.ts";
import { createInteractionCallback } from "../../resources/interactions.ts";

export const baseInteractionMethods = (
  interaction: APIInteraction,
): BaseInteractionMethods => ({
  async reply(data) {
    if (typeof data === "string") {
      data = { content: data } as never;
    }

    if (data.ephemeral) {
      const flags = (data.flags ?? 0) | MessageFlags.Ephemeral;
      data.flags = flags;
    }

    const files = data.files;
    delete data.files;

    return createInteractionCallback(
      interaction.id,
      interaction.token,
      "ChannelMessageWithSource",
      data,
      files,
      { with_response: data?.with_response },
    ) as never;
  },
  async deferReply(data) {
    if (data?.ephemeral) {
      const flags = (data.flags ?? 0) | MessageFlags.Ephemeral;
      data.flags = flags;
    }

    return createInteractionCallback(
      interaction.id,
      interaction.token,
      "DeferredChannelMessageWithSource",
      data,
      undefined,
      { with_response: data?.with_response },
    ) as never;
  },
  async update(data) {
    if (typeof data === "string") {
      data = { content: data } as never;
    }

    const files = data.files;
    delete data.files;

    return createInteractionCallback(
      interaction.id,
      interaction.token,
      "UpdateMessage",
      data,
      files,
      { with_response: data.with_response },
    ) as never;
  },
  async deferUpdate(options) {
    return createInteractionCallback(
      interaction.id,
      interaction.token,
      "DeferredMessageUpdate",
      undefined,
      undefined,
      options,
    );
  },
  editReply: (data) =>
    editWebhookMessage(
      botEnv.DISCORD_APP_ID!,
      interaction.token,
      "@original",
      data,
    ),
  async followUp(
    data:
      | string
      | (APIInteractionResponseCallbackData & {
          files?: RawFile[];
          ephemeral?: boolean;
        }),
  ) {
    if (typeof data === "object" && data.ephemeral) {
      const flags = (data.flags ?? 0) | MessageFlags.Ephemeral;
      data.flags = flags;
    }
    return executeWebhook(botEnv.DISCORD_APP_ID!, interaction.token, data, {
      wait: true,
    });
  },
  async showModal(data, options) {
    return createInteractionCallback(
      interaction.id,
      interaction.token,
      "Modal",
      data,
      undefined,
      options,
    );
  },
  async sendChoices(choices, options) {
    return createInteractionCallback(
      interaction.id,
      interaction.token,
      "ApplicationCommandAutocompleteResult",
      { choices },
      undefined,
      options,
    );
  },
  user: interaction.member?.user ?? interaction.user!,
});
