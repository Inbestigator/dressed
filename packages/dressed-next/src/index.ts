import {
  handleRequest,
  setupCommands,
  setupComponents,
  setupEvents,
} from "dressed/server";
import type { CommandData, ComponentData, EventData } from "dressed/server";
import { waitUntil } from "@vercel/functions";

/**
 * Creates a request handler for Next.js routes that processes commands, components, and events.
 *
 * @param commands - Array of command datas to use
 * @param components - Array of component datas to use
 * @param events - Array of event datas to use
 * @returns A request handler function compatible with Next.js API routes
 */
export default function createHandler(
  commands: CommandData<"ext">[],
  components: ComponentData<"ext">[],
  events: EventData<"ext">[],
): (req: Request) => Promise<Response> {
  const [runCommand, runComponent, runEvent] = [
    setupCommands(commands),
    setupComponents(components),
    setupEvents(events),
  ];

  return (req) =>
    handleRequest(
      req,
      async (i) => waitUntil(runCommand(i)),
      async (i) => waitUntil(runComponent(i)),
      async (i) => waitUntil(runEvent(i)),
    );
}
