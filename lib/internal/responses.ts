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

const userId = env.DISCORD_APP_ID;

export async function reply(
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

  await callDiscord(
    `interactions/${interaction.id}/${interaction.token}/callback`,
    {
      method: "POST",
      body: {
        type: InteractionResponseType.ChannelMessageWithSource,
        data,
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

  await callDiscord(
    `interactions/${interaction.id}/${interaction.token}/callback`,
    {
      method: "POST",
      body: {
        type: InteractionResponseType.UpdateMessage,
        data,
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

  await callDiscord(
    `webhooks/${userId}/${interaction.token}/messages/@original`,
    {
      method: "PATCH",
      body: data,
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
