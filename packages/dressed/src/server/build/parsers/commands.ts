import type { CommandData } from "../../../types/config.ts";
import { createHandlerParser } from "./index.ts";

export const parseCommands = createHandlerParser<CommandData>({
  colNames: ["Command"],
  itemMessages: ({ name }) => ({
    confict: `"${name}" conflicts with another command, skipping the duplicate`,
  }),
  createData: () => ({}),
});
