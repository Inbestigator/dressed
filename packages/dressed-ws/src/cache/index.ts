import { defaultLogic } from "./default.ts";
import type { CachedFunctions, CacheLogic } from "./types.ts";

export function createCache<F extends CachedFunctions>(
  /** The functions to cache */
  functions: F,
  /** Functions for creating a custom cache implementation */
  logic: CacheLogic<F> = defaultLogic({}),
): F {
  const revalidating = new Set<string>();
  return Object.fromEntries(
    Object.entries(functions).map(([k, v]) => [
      k,
      async (...args) => {
        const key = logic.resolveKey(k, args as Parameters<F[string]>);
        const res = await logic.get(key);
        switch (res.state) {
          case "miss": {
            const value = await v(...args);
            logic.set(key, value);
            return value;
          }
          case "stale": {
            if (!revalidating.has(key)) {
              revalidating.add(key);
              v(...args).then((v) => {
                logic.set(key, v);
                revalidating.delete(key);
              });
            }
          }
          // eslint-disable-next-line no-fallthrough
          case "hit":
            return res.value;
        }
      },
    ]),
  ) as ReturnType<typeof createCache<F>>;
}

export * from "./default.ts";
export * from "./getters.ts";
