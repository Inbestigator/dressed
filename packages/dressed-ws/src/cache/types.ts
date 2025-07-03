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
