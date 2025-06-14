import type { EventData } from "../../types/config.ts";
import { type APIWebhookEventBody } from "discord-api-types/v10";
import { createHandlerSetup } from "./index.ts";
import type { AnyEvent } from "../../types/event.ts";

/**
 * Creates the event handler
 * @returns A function that runs an event
 */
export const setupEvents: ReturnType<
  typeof createHandlerSetup<EventData, APIWebhookEventBody, [AnyEvent]>
> = createHandlerSetup({
  itemMessages: (event) => ({
    noItem: `No event handler for "${event.type}"`,
    middlewareKey: "events",
    pending: (item) => `Running event "${item.name}"`,
  }),
  findItem(event, items) {
    const item = items.find((i) => i.data.type === event.type);
    if (!item) {
      return;
    }
    return [item, [event.data]];
  },
});
