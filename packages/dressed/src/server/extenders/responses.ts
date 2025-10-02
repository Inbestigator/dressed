import {
  type APIInteraction,
  type APIInteractionResponseCallbackData,
  type APIUser,
  MessageFlags,
} from "discord-api-types/v10";
import { editWebhookMessage, executeWebhook } from "../../resources/generated.resources.ts";
import { createInteractionCallback } from "../../resources/interactions.ts";
import type { RawFile } from "../../types/file.ts";
import type { BaseInteractionMethods } from "../../types/interaction.ts";
import { botEnv } from "../../utils/env.ts";

export const baseInteractionMethods = (interaction: APIInteraction): BaseInteractionMethods => ({
  async reply(data) {
    if (typeof data === "string") {
      data = { content: data } as Extract<Parameters<BaseInteractionMethods["reply"]>[0], { content: string }>;
    }

    if (data.ephemeral) {
      data.flags = (data.flags ?? 0) | MessageFlags.Ephemeral;
    }

    const files = data.files;
    delete data.files;

    return createInteractionCallback(interaction.id, interaction.token, "ChannelMessageWithSource", data, files, {
      with_response: data?.with_response,
    }) as never;
  },
  async deferReply(data) {
    if (data?.ephemeral) {
      data.flags = (data.flags ?? 0) | MessageFlags.Ephemeral;
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
      data = { content: data } as Extract<Parameters<BaseInteractionMethods["update"]>[0], { content: string }>;
    }

    const files = data.files;
    delete data.files;

    return createInteractionCallback(interaction.id, interaction.token, "UpdateMessage", data, files, {
      with_response: data.with_response,
    }) as never;
  },
  deferUpdate: (options) =>
    createInteractionCallback(
      interaction.id,
      interaction.token,
      "DeferredMessageUpdate",
      undefined,
      undefined,
      options,
    ),
  editReply: (data) => editWebhookMessage(botEnv.DISCORD_APP_ID, interaction.token, "@original", data),
  async followUp(
    data:
      | string
      | (APIInteractionResponseCallbackData & {
          files?: RawFile[];
          ephemeral?: boolean;
        }),
  ) {
    if (typeof data === "object" && data.ephemeral) {
      data.flags = (data.flags ?? 0) | MessageFlags.Ephemeral;
    }
    return executeWebhook(botEnv.DISCORD_APP_ID, interaction.token, data, {
      wait: true,
    });
  },
  showModal: (data, options) =>
    createInteractionCallback(interaction.id, interaction.token, "Modal", data, undefined, options),
  sendChoices: (choices, options) =>
    createInteractionCallback(
      interaction.id,
      interaction.token,
      "ApplicationCommandAutocompleteResult",
      { choices },
      undefined,
      options,
    ),
  user: interaction.member?.user ?? (interaction.user as APIUser),
});
