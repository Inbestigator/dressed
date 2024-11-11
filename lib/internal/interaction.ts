import { yellow } from "@std/fmt/colors";
import type {
  DeferredReplyOptions,
  Interaction,
  InteractionReplyOptions,
} from "./types/interaction.ts";
import { DiscordRequest } from "./utils.ts";
import {
  type APIInteraction,
  InteractionResponseType,
  InteractionType,
  MessageFlags,
} from "discord-api-types/v10";

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

async function reply(
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

async function deferReply(
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

export default function createInteraction<T extends APIInteraction>(
  json: T,
): Interaction<T> {
  switch (json.type) {
    case InteractionType.ApplicationCommand: {
      return {
        ...json,
        reply: (data: InteractionReplyOptions) => reply(json, data),
        deferReply: (data?: DeferredReplyOptions) => deferReply(json, data),
      } as unknown as Interaction<T>;
    }
    case InteractionType.MessageComponent: {
      return {
        ...json,
        reply: (data: InteractionReplyOptions) => reply(json, data),
        deferReply: (data?: DeferredReplyOptions) => deferReply(json, data),
      } as unknown as Interaction<T>;
    }
    default: {
      return null as unknown as Interaction<T>;
    }
  }
}
