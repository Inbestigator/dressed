import type { APIWebhookEventBody, ApplicationWebhookEventType } from "discord-api-types/v10";
import type { EventData } from "../../types/config.ts";
import type { AnyEvent } from "../../types/event.ts";
import { createHandlerSetup } from "./index.ts";

type EventType = typeof ApplicationWebhookEventType;

type ReversedType = { [K in keyof EventType as EventType[K]]: K };

/**
 * Creates the event handler
 * @returns A function that runs an event
 */
export const setupEvents = createHandlerSetup<
  EventData<keyof EventType>,
  APIWebhookEventBody,
  [AnyEvent],
  // @ts-expect-error The ParsedData generic covers all events but we're narrowing to a single here
  { [K in APIWebhookEventBody["type"]]?: EventData<ReversedType[K]> }
>({
  itemMessages: (event) => ({
    noItem: `No event handler for "${event.type}"`,
    pending: () => `Running event "${event.type}"`,
  }),
  findItem(event, items, key) {
    const item = items[event.type];
    if (!item) return;
    return [item, item[key], [event.data]];
  },
});
