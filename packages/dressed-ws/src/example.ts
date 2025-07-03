// TODO Remove this before release

import { createConnection } from "./index.ts";
import { createCache, getters, resolveKey } from "./cache/index.ts";

// Gateway

const connection = createConnection({
  intents: ["GuildMessages"],
});
connection.onReady(async (data) => {
  console.log(data.user.username, "is ready");
});
const clearListener = connection.onMessageCreate(async (d) => {
  process.stdout.write(`${d.author.username} sent a message in ...`);
  const channel = await connection.getChannel(d.channel_id);
  process.stdout.write(
    `\r${d.author.username} sent a message in #${channel.name}\n`,
  );
  clearListener();
});

// Cache

const cache = createCache(getters);

// Cache miss
await cache.getApp();
// Cache hit
await cache.getApp();

// This is demonstrative, and should work if you install the redis lib

const createClient = () => ({
  connect: async () => ({
    get: async (k: string) => k,
    set(..._: unknown[]) {
      void _;
    },
  }),
});

const redis = await createClient().connect();

const customCache = createCache(getters, {
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
  resolveKey,
});
void customCache;
