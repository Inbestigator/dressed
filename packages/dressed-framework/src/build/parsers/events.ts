import { ApplicationWebhookEventType } from "discord-api-types/v10";
import type { EventData } from "dressed/server";
import { logger } from "dressed/utils";
import { createHandlerParser } from "./index.ts";

export const parseEvents: ReturnType<typeof createHandlerParser<EventData>> = createHandlerParser({
  colNames: ["Event"],
  uniqueKeys: ["type"],
  itemMessages: ({ name }) => ({ confict: `"${name}" conflicts with another event, skipping the duplicate` }),
  createData({ name }) {
    const type = ApplicationWebhookEventType[name as keyof typeof ApplicationWebhookEventType];

    if (!type) {
      throw new Error(`${logger.symbols.warn} Event type of "${name}" could not be determined, skipping`, {
        cause: "dressed-parsing",
      });
    }

    return { type };
  },
});
