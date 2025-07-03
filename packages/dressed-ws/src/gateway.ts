import {
  Routes,
  GatewayOpcodes,
  GatewayIntentBits,
  GatewayDispatchEvents,
  type GatewayIdentify,
  type GatewayHeartbeat,
  type APIGatewayBotInfo,
  type GatewayIdentifyData,
  type GatewayReceivePayload,
  type GatewayDispatchPayload,
} from "discord-api-types/v10";
import { botEnv, callDiscord } from "dressed/utils";
import { platform } from "node:process";
import { createCache, getters } from "./cache/index.ts";
import type { CacheLogic } from "./cache/types.ts";

async function getGatewayBot(): Promise<APIGatewayBotInfo> {
  const res = await callDiscord(Routes.gatewayBot(), { method: "GET" });
  return res.json();
}

type EventKeys = keyof typeof GatewayDispatchEvents;

type ConnectionActions = {
  [K in EventKeys as `on${K}`]: (
    callback: (
      data: (GatewayDispatchPayload extends infer U
        ? U extends { t: infer T }
          ? (typeof GatewayDispatchEvents)[K] extends T
            ? U
            : never
          : never
        : never)["d"],
    ) => void,
  ) => () => void;
} & ReturnType<typeof createCache<typeof getters>>;

/** Create a connection to the Discord gateway */
export function createConnection(
  config: Omit<
    Partial<GatewayIdentifyData>,
    "intents" | "properties" | "compress" | "large_threshold"
  > & {
    /**
     * The Gateway Intents you wish to receive
     *
     * @see {@link https://discord.com/developers/docs/topics/gateway#gateway-intents}
     */
    intents?: (keyof typeof GatewayIntentBits)[];
    cache?: CacheLogic<typeof getters>;
  } = {},
): ConnectionActions {
  const {
    cache: cacheConfig,
    intents = [],
    token = botEnv.DISCORD_TOKEN,
    ...connectionConfig
  } = config;
  const listeners = new Map<string, Map<string, (data: unknown) => void>>();

  process.env.DISCORD_TOKEN = token;

  async function connect() {
    const { url } = await getGatewayBot();
    const ws = new WebSocket(url);

    let heartbeatInterval: NodeJS.Timeout;
    let lastSeq: number | null = null;

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data) as GatewayReceivePayload;

      if (payload.s !== null) {
        lastSeq = payload.s;
      }

      switch (payload.op) {
        case GatewayOpcodes.Hello: {
          const { heartbeat_interval } = payload.d;

          heartbeatInterval = setInterval(() => {
            const heartbeatPayload: GatewayHeartbeat = {
              op: GatewayOpcodes.Heartbeat,
              d: lastSeq,
            };
            ws.send(JSON.stringify(heartbeatPayload));
          }, heartbeat_interval);

          const identifyPayload: GatewayIdentify = {
            op: GatewayOpcodes.Identify,
            d: {
              ...connectionConfig,
              token,
              intents: intents.reduce(
                (acc, intent) => acc | GatewayIntentBits[intent],
                0,
              ),
              properties: {
                os: platform,
                browser: "Dressed",
                device: "Dressed",
              },
            },
          };
          ws.send(JSON.stringify(identifyPayload));
          break;
        }
        case GatewayOpcodes.Dispatch: {
          const { t, d } = payload;
          const eventListeners = listeners.get(t);
          if (eventListeners) {
            for (const callback of eventListeners.values()) {
              callback(d);
            }
          }
          break;
        }
        case GatewayOpcodes.HeartbeatAck: {
          break;
        }
        default:
          break;
      }
    };

    ws.onclose = () => {
      clearInterval(heartbeatInterval);
      console.log("Disconnected");
    };

    ws.onerror = (err) => {
      console.error("WebSocket error", err);
    };
  }

  connect();

  return {
    ...Object.fromEntries(
      Object.keys(GatewayDispatchEvents).map((k) => [
        `on${k}`,
        (callback: () => never) => {
          const id = crypto.randomUUID();
          const eventName = GatewayDispatchEvents[k as EventKeys];
          if (!listeners.has(eventName)) listeners.set(eventName, new Map());
          listeners.get(eventName)!.set(id, callback);
          return () => listeners.get(eventName)?.delete(id);
        },
      ]),
    ),
    ...createCache(getters, cacheConfig),
  } as ReturnType<typeof createConnection>;
}
