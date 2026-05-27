import { loadEnvConfig } from "../utils/dotenv.ts";

import { createServer as createHttpServer, type Server } from "node:http";
import type { CommandData, ComponentData, EventData, ServerConfig } from "../types/config.ts";
import type { CommandRunner, ComponentRunner, EventRunner } from "../types/handlers.ts";
import { config as dressedConfig } from "../utils/env.ts";
import logger from "../utils/log.ts";
import { handleRequest } from "./handler.ts";
import { verifySignature } from "./signature.ts";

loadEnvConfig();

/**
 * Starts a server to handle interactions.
 * @returns The server instance
 */
export function createServer(
  commands: CommandRunner | CommandData[],
  components: ComponentRunner | ComponentData[],
  events: EventRunner | EventData[],
  config: ServerConfig = {},
): Server {
  config = { ...dressedConfig.server, ...config };
  const hooks = { ...dressedConfig.hooks, ...config.hooks };
  const port = config.port ?? 8000;
  const endpoint = new URL(config.endpoint ?? "/", `http://localhost:${port}`);
  const server = createHttpServer(async (req, res) => {
    if (req.url !== endpoint.pathname) {
      return res.writeHead(404).end();
    } else if (req.method !== "POST") {
      return res.writeHead(405).end();
    }

    const stdReq = new Request(endpoint, {
      method: "POST",
      // @ts-expect-error Headers will init from an object, the type is just weird
      headers: req.headers,
      // @ts-expect-error The node:http req reads to a body
      body: req,
      duplex: "half", // Undici throws if this isn't present when body is a stream -inb
    });

    let observeRes: ((r: Response) => void) | undefined;
    hooks.onServerRequest?.(stdReq.clone(), new Promise<Response>((r) => (observeRes = r)));

    const handlerRes = await handleRequest(stdReq, commands, components, events, hooks);

    observeRes?.(handlerRes.clone());

    res.writeHead(handlerRes.status, { "Content-Type": "application/json" }).end(await handlerRes.text());
  });

  server.listen(port, "0.0.0.0", () => logger.succeed("Bot is now listening on", endpoint.href));

  const shutdown = () => server.close(() => process.exit());
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  return server;
}
