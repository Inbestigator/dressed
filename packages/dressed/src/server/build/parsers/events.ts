import type { EventData } from "../../../types/config.ts";
import ora from "ora";
import { ApplicationWebhookEventType } from "discord-api-types/v10";
import { createHandlerParser } from "./index.ts";

export const parseEvents = createHandlerParser<EventData>({
  col1Name: "Event",
  messages: {
    pending: "Generating events",
    generated: "Generated events",
    noItems: "No events found",
  },
  uniqueKeys: ["type"],
  itemMessages: ({ name }) => ({
    confict: `"${name}" conflicts with another event, skipping the duplicate`,
  }),
  async createData({ name }) {
    const type =
      ApplicationWebhookEventType[
        name as keyof typeof ApplicationWebhookEventType
      ];

    if (!type) {
      ora(`Event type of "${name}" could not be determined, skipping`).warn();
      throw null;
    }

    return { type };
  },
});
