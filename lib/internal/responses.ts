import {
  type APIInteraction,
  InteractionResponseType,
  MessageFlags,
} from "discord-api-types/v10";
import { yellow } from "@std/fmt/colors";
import type {
  DeferredReplyOptions,
  InteractionReplyOptions,
} from "./types/interaction.ts";
import { DiscordRequest } from "./utils.ts";
import type { EditMessageOptions } from "./types/messages.ts";

const userId = Deno.env.get("DISCORD_APP_ID");

function createMessageFlags(flags: MessageFlags[]) {
  let bitfield = 0;

  flags.forEach((flag) => {
    if (flag in MessageFlags) {
      bitfield |= flag;
    } else {
      console.warn(` ${yellow("!")} Unknown message flag: ${flag}`);
    }
  });

  return bitfield;
}

export async function reply(
  interaction: APIInteraction,
  data: InteractionReplyOptions,
) {
  if (typeof data === "string") {
    data = { content: data };
  }

  if (typeof data.flags !== "number") {
    if (data.ephemeral) {
      data.flags = [...(data.flags ?? []), MessageFlags.Ephemeral];
    }
    data.flags = createMessageFlags(data.flags ?? []);
  }

  await DiscordRequest(
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
  if (data && typeof data.flags !== "number") {
    if (data.ephemeral) {
      data.flags = [...(data.flags ?? []), MessageFlags.Ephemeral];
    }
    data.flags = createMessageFlags(data.flags ?? []);
  }

  await DiscordRequest(
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
  data: EditMessageOptions,
) {
  if (typeof data === "string") {
    data = { content: data };
  }

  await DiscordRequest(
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
  data: EditMessageOptions,
) {
  if (typeof data === "string") {
    data = { content: data };
  }

  await DiscordRequest(
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

  if (typeof data.flags !== "number") {
    if (data.ephemeral) {
      data.flags = [...(data.flags ?? []), MessageFlags.Ephemeral];
    }
    data.flags = createMessageFlags(data.flags ?? []);
  }

  await DiscordRequest(`webhooks/${userId}/${interaction.token}`, {
    method: "POST",
    body: data,
  });
}
