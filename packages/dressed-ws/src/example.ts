// TODO Remove this before release

import { createCache, getters, resolveKey } from "./cache/index.ts";
import { createConnection } from "./gateway.ts";

// Cache

const cache = createCache(getters, {
  desiredProps: { getApp: ["approximate_guild_count"] },
});

// Cache miss
await cache.getApp();
// Cache hit
console.log(await cache.getApp()); // Narrowed because of desiredProps

// This is demonstrative, and should work if you install the redis lib

/** Dummy redis */
const createClient = () => ({
  connect: async () => ({
    get: async (k: string) => k,
    set(..._: unknown[]) {
      void _;
    },
  }),
});

const redis = await createClient().connect();

const customCache = createCache(
  {
    hi: async () => ({
      greetings: ["hi"],
      goodbies: ["bye"],
    }),
  },
  {
    desiredProps: { hi: ["greetings"] },
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
      resolveKey,
    },
  },
);
void customCache;

// Gateway

const connection = createConnection({
  intents: ["GuildMessages"],
});
connection.onReady(async (data) => {
  console.log(data.user.username, "is ready");
});
const clearListener = connection.onMessageCreate(async (d) => {
  process.stdout.write(`${d.author.username} sent a message in ...`);
  const channel = await cache.getChannel(d.channel_id);
  process.stdout.write(
    `\r${d.author.username} sent a message in #${channel.name}\n`,
  );
  clearListener();
});
