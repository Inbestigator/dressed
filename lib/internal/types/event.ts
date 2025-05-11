import type {
  APIWebhookEventBody,
  ApplicationWebhookEventType,
} from "discord-api-types/v10";

export type Event<T extends keyof typeof ApplicationWebhookEventType> = Extract<
  APIWebhookEventBody,
  { type: typeof ApplicationWebhookEventType[T] }
>["data"];
