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
 * @param commands - Array of command data to process
 * @param components - Array of component data to process
 * @param events - Array of event data to process
 * @returns A request handler function compatible with Next.js API routes
 */
export function createHandler(
  commands: CommandData[],
  components: ComponentData[],
  events: EventData[],
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
