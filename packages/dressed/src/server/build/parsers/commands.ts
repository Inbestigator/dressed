import type { CommandData } from "../../../types/config.ts";
import { createHandlerParser } from "./index.ts";

export const parseCommands = createHandlerParser<CommandData>({
  col1Name: "Command",
  messages: {
    pending: "Generating commands",
    generated: "Generated commands",
    noItems: "No commands found",
  },
  itemMessages: (file) => ({
    confict: `"${file.name}" conflicts with another command, skipping the duplicate`,
  }),
  async createData(file) {
    const { config } = await import(file.path);
    return { config };
  },
});
