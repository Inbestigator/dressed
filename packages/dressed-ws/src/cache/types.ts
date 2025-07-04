export type CachedFunctions = Record<
  string,
  (...args: never[]) => Promise<unknown>
>;
export type CacheResponse =
  | { value: unknown; state: "hit" | "stale" }
  | { state: "miss" };

export interface CacheLogic<F extends CachedFunctions> {
  /** Get a key from the cache */
  get: (key: string) => CacheResponse | Promise<CacheResponse>;
  /** Set a new value in the cache */
  set: (key: string, value: unknown) => unknown;
  /** Delete a key from the cache */
  delete: (key: string) => unknown;
  /** Return a key to be used in the cache */
  resolveKey: <K extends keyof F>(key: K, args: Parameters<F[K]>) => string;
}
