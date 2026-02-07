import type { EventData } from "dressed/server";
import { createHandlerParser } from "./index.ts";

export const parseEvents: ReturnType<typeof createHandlerParser<EventData>> = createHandlerParser({
  colNames: ["Event"],
  uniqueKeys: ["type"],
  itemMessages: ({ name }) => ({ confict: `"${name}" conflicts with another event, skipping the duplicate` }),
  createData: ({ name }) => ({ type: name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toUpperCase() }),
});
