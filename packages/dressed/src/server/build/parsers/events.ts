import { ApplicationWebhookEventType } from "discord-api-types/v10";
import type { EventData } from "../../../types/config.ts";
import { logWarn } from "../../../utils/log.ts";
import { createHandlerParser } from "./index.ts";

export const parseEvents = createHandlerParser<EventData>({
  col1Name: "Event",
  uniqueKeys: ["type"],
  itemMessages: ({ name }) => ({
    confict: `"${name}" conflicts with another event, skipping the duplicate`,
  }),
  createData({ name }) {
    const type = ApplicationWebhookEventType[name as keyof typeof ApplicationWebhookEventType];

    if (!type) {
      logWarn(`Event type of "${name}" could not be determined, skipping`);
      throw null;
    }

    return { type };
  },
});
