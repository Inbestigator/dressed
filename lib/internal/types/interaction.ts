import {
  APIApplicationCommandInteraction,
  APIInteraction,
  APIMessageComponentInteraction,
} from "discord-api-types/v10";

export type ApplicationCommandInteraction = APIApplicationCommandInteraction & {
  reply: (data: InteractionReplyOptions) => Promise<void>;
  deferReply: (data: DeferredReplyOptions) => Promise<void>;
};

export type MessageComponentInteraction = APIMessageComponentInteraction & {
  reply: (data: InteractionReplyOptions) => Promise<void>;
  deferReply: (data: DeferredReplyOptions) => Promise<void>;
};

export interface DeferredReplyOptions {
  ephemeral?: boolean;
}

export type InteractionReplyOptions =
  | {
    content?: string;
  }
  | string;

export type Interaction<T extends APIInteraction> = T extends
  APIApplicationCommandInteraction ? ApplicationCommandInteraction
  : T extends APIMessageComponentInteraction ? MessageComponentInteraction
  : null;
