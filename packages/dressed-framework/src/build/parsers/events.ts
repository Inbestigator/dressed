import type { EventData, setupEvents } from "dressed/server";
import type { WalkEntry } from "../../types/walk.ts";
import { createHandlerParser } from "./index.ts";

export const parseEvents: ReturnType<
  typeof createHandlerParser<
    EventData,
    { [K in keyof Parameters<typeof setupEvents>[0]]: EventData & WalkEntry },
    "default"
  >
> = createHandlerParser({
  colNames: ["Event"],
  itemMessages: ({ name }) => ({ confict: `"${name}" conflicts with another event, skipping the duplicate` }),
  createData: ({ name }) => [[name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toUpperCase()], { name }],
});
