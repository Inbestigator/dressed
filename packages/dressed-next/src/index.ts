import {
  handleRequest,
  setupCommands,
  setupComponents,
  setupEvents,
} from "dressed/server";
import type {
  BaseData,
  CommandData,
  ComponentData,
  EventData,
} from "dressed/server";
import { waitUntil } from "@vercel/functions";

/**
 * Creates a request handler for Next.js routes that processes commands, components, and events.
 *
 * @example
 * ```ts
 * // app/bot/route.ts
 * import createHandler from "@dressed/next";
 * import { commands, components, events } from "@/.dressed";
 *
 * export const POST = createHandler(commands, components, events);
 * ```
 *
 * @param commands - Array of command datas to use
 * @param components - Array of component datas to use
 * @param events - Array of event datas to use
 * @returns A request handler function compatible with Next.js API routes
 */
export default function createHandler(
  commands: BaseData<CommandData>[],
  components: BaseData<ComponentData>[],
  events: BaseData<EventData>[],
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
      async (e) => waitUntil(runEvent(e)),
    );
}
