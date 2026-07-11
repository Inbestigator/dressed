import type { CommandData } from "dressed/server";
import type { WalkEntry } from "../../types/walk.ts";
import { createHandlerParser } from "./index.ts";

export const parseCommands: ReturnType<
  typeof createHandlerParser<CommandData, Record<string, CommandData & WalkEntry>>
> = createHandlerParser({
  colNames: ["Command"],
  itemMessages: ({ name }) => ({ confict: `"${name}" conflicts with another command, skipping the duplicate` }),
  createData: ({ name }) => [[name], {}],
  desiredExports: ["autocomplete", "config", "default"],
});
