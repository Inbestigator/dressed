import type { CommandData } from "../../../types/config.ts";
import { createHandlerParser } from "./index.ts";

export const parseCommands = createHandlerParser<CommandData>({
  col1Name: "Command",
  messages: {
    pending: "Generating commands",
    noItems: "No commands found",
  },
  itemMessages: ({ name }) => ({
    confict: `"${name}" conflicts with another command, skipping the duplicate`,
  }),
  createData: () => ({}),
});
