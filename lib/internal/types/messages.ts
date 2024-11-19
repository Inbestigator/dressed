import type { APIEmbed, MessageFlags } from "discord-api-types/v10";
import type { ActionRow } from "../../core/components/actionrow.ts";

export type MessageComponents = ReturnType<typeof ActionRow>[];

export type MessageOptions =
  | {
    content?: string;
    embeds?: APIEmbed[];
    components?: MessageComponents;
    flags?: MessageFlags[] | number;
  }
  | string;
