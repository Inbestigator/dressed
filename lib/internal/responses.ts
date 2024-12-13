import {
  type APIInteraction,
  InteractionResponseType,
  MessageFlags,
} from "discord-api-types/v10";
import type {
  DeferredReplyOptions,
  InteractionReplyOptions,
} from "./types/interaction.ts";
import { callDiscord } from "./utils.ts";
import type { MessageOptions } from "./types/messages.ts";
import { env } from "node:process";
import { handleAttachments } from "../core/bot/messages.ts";

const userId = env.DISCORD_APP_ID;

export async function reply(
  interaction: APIInteraction,
  data: InteractionReplyOptions,
) {
  if (typeof data === "string") {
    data = { content: data };
  }

  const formData = new FormData();

  data = handleAttachments(data, formData);

  if (data.ephemeral) {
    const flags = (data.flags ?? 0) | MessageFlags.Ephemeral;
    data.flags = flags;
  }

  formData.append("payload_json", JSON.stringify(data));

  await callDiscord(
    `interactions/${interaction.id}/${interaction.token}/callback`,
    {
      method: "POST",
      body: {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: formData,
      },
    },
  );
}

export async function deferReply(
  interaction: APIInteraction,
  data?: DeferredReplyOptions,
) {
  if (data?.ephemeral) {
    const flags = (data.flags ?? 0) | MessageFlags.Ephemeral;
    data.flags = flags;
  }

  await callDiscord(
    `interactions/${interaction.id}/${interaction.token}/callback`,
    {
      method: "POST",
      body: {
        type: InteractionResponseType.DeferredChannelMessageWithSource,
        data,
      },
    },
  );
}

export async function update(
  interaction: APIInteraction,
  data: MessageOptions,
) {
  if (typeof data === "string") {
    data = { content: data };
  }

  const formData = new FormData();

  data = handleAttachments(data, formData);

  formData.append("payload_json", JSON.stringify(data));

  await callDiscord(
    `interactions/${interaction.id}/${interaction.token}/callback`,
    {
      method: "POST",
      body: {
        type: InteractionResponseType.UpdateMessage,
        data: formData,
      },
    },
  );
}

export async function editReply(
  interaction: APIInteraction,
  data: MessageOptions,
) {
  if (typeof data === "string") {
    data = { content: data };
  }

  const formData = new FormData();

  data = handleAttachments(data, formData);

  formData.append("payload_json", JSON.stringify(data));

  await callDiscord(
    `webhooks/${userId}/${interaction.token}/messages/@original`,
    {
      method: "PATCH",
      body: formData,
    },
  );
}

export async function followUp(
  interaction: APIInteraction,
  data: InteractionReplyOptions,
) {
  if (typeof data === "string") {
    data = { content: data };
  }

  if (data.ephemeral) {
    const flags = (data.flags ?? 0) | MessageFlags.Ephemeral;
    data.flags = flags;
  }

  await callDiscord(`webhooks/${userId}/${interaction.token}`, {
    method: "POST",
    body: data,
  });
}
