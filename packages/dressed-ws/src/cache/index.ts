import { defaultLogic } from "./default.ts";

export type CachedFunctions = Record<
  string,
  (...args: never[]) => Promise<unknown>
>;
export type CacheResponse =
  | { value: unknown; state: "hit" | "stale" }
  | { state: "miss" };

export interface CacheLogic<F extends CachedFunctions> {
  /** Used to get a value from the cache */
  get: (key: string) => CacheResponse | Promise<CacheResponse>;
  /** Used to set a new value in the cache */
  set: (key: string, value: unknown) => void;
  /** Return a key to be used in the cache */
  resolveKey: <K extends keyof F>(key: K, args: Parameters<F[K]>) => string;
}
export function createCache<F extends CachedFunctions>(
  /** The functions to cache */
  functions: F,
  /** Functions for creating a custom cache implementation */
  logic: CacheLogic<F> = defaultLogic({}),
): F {
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
          case "stale":
            v(...args).then((v) => logic.set(key, v));
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
