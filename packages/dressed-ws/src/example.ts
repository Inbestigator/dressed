// TODO Remove this before release

import { hash } from "bun";
import { createCache, defaultLogic, getters } from "./cache/index.ts";
import { createConnection } from "./gateway.ts";

// Cache

// This is valid and works if you install the redis lib

/** Dummy redis */
const createClient = () => {
  const inMem = defaultLogic();
  return {
    connect: async () => ({
      get: async (k: string) => inMem.get(k).value as string | undefined,
      set: (...[k, v]: [string, string, object]) => inMem.set(k, v),
      del: inMem.delete,
    }),
  };
};

const redis = await createClient().connect();

const customCache = createCache(getters, {
  desiredProps: { getChannel: ["name"] },
  logic: {
    async get(key) {
      const res = await redis.get(key);
      if (!res) return { state: "miss" };
      return { state: "hit", value: JSON.parse(res) };
    },
    set(key, value) {
      redis.set(key, JSON.stringify(value), {
        expiration: { type: "EX", value: 300 },
      });
    },
    delete: redis.del,
    resolveKey(key, args) {
      return hash(`${key}:${JSON.stringify(args)}`).toString();
    },
  },
});

// Gateway

const connection = createConnection({
  intents: ["GuildMessages"],
});
connection.onReady(async (data) => {
  console.log(data.user.username, "is ready");
});
const stopListening = connection.onMessageCreate(async (d) => {
  process.stdout.write(`${d.author.username} sent a message in ...`);
  const channel = await customCache.getChannel(d.channel_id);
  process.stdout.write(
    `\r${d.author.username} sent a message in #${channel.name}\n`,
  );
  if (d.content === "$stop") {
    stopListening();
    customCache.getChannel.clear(d.channel_id);
  }
});
