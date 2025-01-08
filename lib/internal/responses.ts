import {
  type APIInteraction,
  type APIInteractionResponseCallbackData,
  type APIModalInteractionResponseCallbackData,
  InteractionResponseType,
  MessageFlags,
  Routes,
} from "discord-api-types/v10";
import { callDiscord } from "./utils.ts";
import { env } from "node:process";
import type { RawFile } from "./types/file.ts";
import type { BaseInteractionMethods } from "./types/interaction.ts";

const appId = env.DISCORD_APP_ID;

export const baseInteractionMethods = (
  interaction: APIInteraction,
): BaseInteractionMethods => ({
  reply: async function (
    data,
  ) {
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
  deferReply: async function (data) {
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
  update: async function (
    data,
  ) {
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
  deferUpdate: async function () {
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
  editReply: async function (data) {
    if (typeof data === "string") {
      data = { content: data };
    }

    const files = data.files;
    delete data.files;

    await callDiscord(
      Routes.webhookMessage(appId!, interaction.token),
      {
        method: "PATCH",
        body: data,
        files,
      },
    );
  },
  followUp: async function (
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

    await callDiscord(Routes.webhook(appId!, interaction.token), {
      method: "POST",
      body: data,
      files,
    });
  },
  showModal: async function (
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
  user: interaction.member?.user ?? interaction.user!,
});
