// TODO Remove this before release

import { createCache } from "./index.ts";
import { resolveKey } from "./default.ts";
import { getters } from "./getters.ts";

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
