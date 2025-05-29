import type { EventData } from "../../types/config.ts";
import { type APIWebhookEventBody } from "discord-api-types/v10";
import { createHandlerSetup } from "./index.ts";

/**
 * Creates the event handler
 * @returns A function that runs an event
 */
export const setupEvents = createHandlerSetup<EventData, APIWebhookEventBody>({
  itemMessages: (event) => ({
    noItem: `No event handler for "${event.type}"`,
    pending: (item) => `Running event "${item.name}"`,
  }),
  findItem(event, items) {
    const item = items.find((i) => i.data.type === event.type);
    if (!item) {
      return;
    }
    return [item, [event]];
  },
});
