import { waitUntil } from "@vercel/functions";
import type { CommandData, ComponentData, EventData, ServerConfig } from "dressed/server";
import { handleRequest, setupCommands, setupComponents, setupEvents } from "dressed/server";

/**
 * Creates a request handler for Next.js routes that processes commands, components, and events.
 *
 * @example
 * ```ts
 * // app/bot/route.ts
 * import createHandler from "@dressed/next";
 * import { commands, components, events, config } from "@/.dressed";
 *
 * export const POST = createHandler(commands, components, events, config);
 * ```
 *
 * @param commands - Array of command datas to use
 * @param components - Array of component datas to use
 * @param events - Array of event datas to use
 * @param config - Your server config object
 * @returns A request handler function compatible with Next.js API routes
 */
export default function createHandler(
  commands: CommandData[],
  components: ComponentData[],
  events: EventData[],
  config?: ServerConfig,
): (req: Request) => Promise<Response> {
  const [runCommand, runComponent, runEvent] = [
    setupCommands(commands),
    setupComponents(components),
    setupEvents(events),
  ];

  return (req) =>
    handleRequest(
      req,
      async (...p) => waitUntil(runCommand(...p)),
      async (...p) => waitUntil(runComponent(...p)),
      async (...p) => waitUntil(runEvent(...p)),
      config,
    );
}
