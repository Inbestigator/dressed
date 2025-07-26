import type {
  GatewayIdentifyData,
  GatewayDispatchPayload,
  GatewaySendPayload,
  GatewayOpcodes,
  APIGatewayBotInfo,
} from "discord-api-types/v10";
import {
  GatewayDispatchEvents,
  GatewayIntentBits,
} from "discord-api-types/v10";
import { getGatewayBot } from "dressed";
import { botEnv } from "dressed/utils";
import { env } from "node:process";

type EventKeys = keyof typeof GatewayDispatchEvents;

export type ConnectionActions = {
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
} & {
  /**
   * Sends a gateway payload to Discord using the given opcode.
   * @param opcode The event to emit
   * @param payload The data to send
   * @param shardId Only emit from one shard
   */
  emit: <
    K extends keyof Omit<
      typeof GatewayOpcodes,
      "Dispatch" | "Reconnect" | "InvalidSession" | "Hello" | "HeartbeatAck"
    >,
  >(
    opcode: K,
    payload: Extract<
      GatewaySendPayload,
      { op: (typeof GatewayOpcodes)[K] }
    >["d"],
    shardId?: number,
  ) => void;
  shards: { reshard: (n?: number) => Promise<void>; workers: Worker[] };
};

export function createConnection(
  config: Omit<
    Partial<GatewayIdentifyData>,
    "intents" | "properties" | "compress" | "large_threshold" | "shard"
  > & {
    intents?: (keyof typeof GatewayIntentBits)[];
  } = {},
): ConnectionActions {
  const { intents = [], token = botEnv.DISCORD_TOKEN, ...rest } = config;

  const listeners = new Map<string, Map<string, (data: unknown) => void>>();
  const workers: Worker[] = [];
  let bot: APIGatewayBotInfo | undefined;

  env.DISCORD_TOKEN = token;

  async function reshard(newCount?: number) {
    bot ??= await getGatewayBot();
    newCount ??= bot.shards;
    if (newCount < workers.length) {
      while (workers.length > newCount) {
        workers.pop()?.terminate();
      }
    } else if (newCount > workers.length) {
      while (workers.length < newCount) {
        const worker = new Worker(new URL("./worker.js", import.meta.url), {
          type: "module",
        });

        worker.postMessage({
          type: "connect",
          config: {
            token,
            intents: intents.reduce(
              (acc, intent) => acc | GatewayIntentBits[intent],
              0,
            ),
            ...rest,
            bot,
            shard: [workers.length, newCount],
          },
        });

        worker.onmessage = (event) => {
          const { type, t, d } = event.data;
          if (type === "dispatch" && t) {
            const eventListeners = listeners.get(t);
            if (eventListeners) {
              for (const callback of eventListeners.values()) {
                callback(d);
              }
            }
          }
        };

        workers.push(worker);
      }
    }
  }

  reshard();

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
    emit(op, d, id) {
      if (id != null) {
        workers[id]?.postMessage({ type: "emit", op, d });
      } else {
        for (const worker of workers) {
          worker.postMessage({ type: "emit", op, d });
        }
      }
    },
    shards: { reshard, workers },
  } as ReturnType<typeof createConnection>;
}
