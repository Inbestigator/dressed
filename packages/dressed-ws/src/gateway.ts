import { env } from "node:process";
import { Worker } from "node:worker_threads";
import type {
  APIGatewayBotInfo,
  GatewayDispatchPayload,
  GatewayIdentifyData,
  GatewayOpcodes,
  GatewaySendPayload,
} from "discord-api-types/v10";
import { GatewayDispatchEvents, GatewayIntentBits } from "discord-api-types/v10";
import { getGatewayBot } from "dressed";
import { botEnv } from "dressed/utils";
import { type Cache, createCache } from "./cache/index.ts";
import { startAutoResharder } from "./resharder.ts";

type EventKey = keyof typeof GatewayDispatchEvents;
interface ListenerConfig {
  /** The event should only be handled once */
  once?: boolean;
}

type ParentMsg = {
  type: "dispatch";
  t: GatewayDispatchEvents;
  shard: [number, number];
  d: GatewayDispatchPayload;
};

export type ConnectionActions = {
  [K in EventKey as `on${K}`]: (
    callback: (
      data: (GatewayDispatchPayload extends infer U
        ? U extends { t: infer T }
          ? (typeof GatewayDispatchEvents)[K] extends T
            ? U
            : never
          : never
        : never)["d"],
    ) => void,
    config?: ListenerConfig,
  ) => () => void;
} & {
  /**
   * Sends a gateway payload to Discord using the given opcode.
   * @param opcode The event to emit
   * @param payload The data to send
   */
  emit: <
    K extends keyof Omit<typeof GatewayOpcodes, "Dispatch" | "Reconnect" | "InvalidSession" | "Hello" | "HeartbeatAck">,
  >(
    opcode: K,
    payload: Extract<GatewaySendPayload, { op: (typeof GatewayOpcodes)[K] }>["d"],
  ) => void;
  shards: {
    /**
     * Change the number of shards that the bot is currently using.
     * @param n Number of shards to use
     */
    reshard: (n?: number) => Promise<void>;
    /** `getGatewayBot` cache */
    cache: Cache<{ getGatewayBot: typeof getGatewayBot }>;
    /** Whether the bot is currently resharding */
    isResharding: boolean;
    /** The auto-resharder interval */
    reshardInterval?: NodeJS.Timeout;
    /** The current number of shards the bot is using (only updated after resharding finishes) */
    numShards: number;
    /** The workers containing the shards */
    workers: Worker[];
  };
};

/**
 * Establish a connection with the Discord Gateway
 * @returns Functions for interacting with the connection and resharding
 */
export function createConnection(
  config: Omit<Partial<GatewayIdentifyData>, "intents" | "properties" | "compress" | "large_threshold" | "shard"> & {
    intents?: (keyof typeof GatewayIntentBits)[];
    shards?: {
      /**
       * The interval in minutes between reshard calculations.
       *
       * Setting to `-1` disables auto-resharding
       * @default 480 // (8 hours)
       */
      reshardInterval?: number;
      /**
       * The number of shards that each worker should control
       * @default 100
       */
      shardsPerWorker?: number;
      /**
       * The percentage of total allowed guilds for each shard to target.
       * For example, a value of 80 means each shard will target 80% of the 2,500 guild cap (2,000 guilds).
       *
       * Setting to `0` disables auto-resharding
       * @default 80
       */
      shardCapacity?: number;
      /**
       * A function that will return the gateway bot, the response controls shards and is saved in the cache for a short time.
       *
       * @warn This function must still return a phony value when connecting with a user token
       */
      getGatewayBot?: () => ReturnType<typeof getGatewayBot>;
    };
  } = {},
): ConnectionActions {
  const { intents = [], token = botEnv.DISCORD_TOKEN, shards = {}, ...rest } = config;

  const listeners = new Map<string, Map<string, { callback: (data: unknown) => void; config: ListenerConfig }>>();
  const workers: Worker[] = [];
  let bot: APIGatewayBotInfo | undefined;

  env.DISCORD_TOKEN = token;

  const connection = {
    ...Object.fromEntries(
      Object.keys(GatewayDispatchEvents).map((k) => [
        `on${k}`,
        (callback: () => unknown, config = {}) => {
          const id = crypto.randomUUID();
          const eventName = GatewayDispatchEvents[k as EventKey];
          if (!listeners.has(eventName)) listeners.set(eventName, new Map());
          listeners.get(eventName)?.set(id, { callback, config });
          return () => listeners.get(eventName)?.delete(id);
        },
      ]),
    ),
    emit(op, d) {
      for (const worker of workers) {
        worker.postMessage({ type: "emit", op, d });
      }
    },
    shards: {
      workers,
      numShards: 0,
      isResharding: false,
      cache: createCache({
        getGatewayBot: config.shards?.getGatewayBot ?? (() => getGatewayBot({ authorization: `Bot ${token}` })),
      }),
      async reshard(newShardCount?: number) {
        if (connection.shards.isResharding) {
          throw new Error("Attempted to reshard while already resharding");
        }

        connection.shards.isResharding = true;
        bot ??= await connection.shards.cache.getGatewayBot();
        newShardCount ??= bot.shards;
        const prevShardCount = connection.shards.numShards;
        const shardsPerWorker = shards.shardsPerWorker ?? 100;

        if (newShardCount === prevShardCount) return;

        const newWorkers = Math.ceil(newShardCount / shardsPerWorker);
        while (newWorkers < workers.length) workers.pop()?.terminate();

        const maxConcurrency = bot.session_start_limit.max_concurrency;
        const numBuckets = Math.floor(newShardCount / maxConcurrency);

        for (let bucketId = 0; bucketId < numBuckets; ++bucketId) {
          for (let i = 0; i < maxConcurrency; ++i) {
            let worker = workers[Math.floor((bucketId * maxConcurrency + i) / shardsPerWorker)];
            if (!worker) {
              worker = new Worker(new URL("./worker.js", import.meta.url));
              worker.on("message", ({ type, t, d, shard }: ParentMsg) => {
                if (type === "dispatch" && t && shard[1] === connection.shards.numShards) {
                  const eventListeners = listeners.get(t);
                  if (eventListeners) {
                    for (const [id, callback] of eventListeners) {
                      callback.callback(d);
                      if (callback.config.once) {
                        eventListeners.delete(id);
                      }
                    }
                  }
                }
              });
              workers.push(worker);
            }

            worker.postMessage({
              type: "addShard",
              config: {
                token,
                intents: intents.reduce((p, intent) => p | GatewayIntentBits[intent], 0),
                ...rest,
                bot,
                shard: [bucketId * maxConcurrency + i, newShardCount],
              },
            });
          }
          if (bucketId < numBuckets - 1) {
            await new Promise((res) => setTimeout(res, 5000));
          }
        }

        connection.shards.numShards = newShardCount;

        for (let i = 0; i < prevShardCount; ++i) {
          const worker = workers[Math.floor(i / prevShardCount)];
          if (!worker) continue;
          worker.postMessage({
            type: "removeShard",
            shardId: `${i},${prevShardCount}`,
          });
        }

        connection.shards.isResharding = false;
      },
    },
  } as ReturnType<typeof createConnection>;

  connection.shards.reshardInterval = startAutoResharder(connection, shards.reshardInterval, shards.shardCapacity);

  return connection;
}
