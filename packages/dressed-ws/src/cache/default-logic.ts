import { hash } from "node:crypto";
import type { CachedFunctions, DefaultLogic } from "./types.ts";

interface Config {
  /**
   * Time To Live
   * @description Time in seconds before a cache entry is considered stale
   * @default 300 // 5 minutes
   */
  ttl?: number;
  /**
   * Stale While Revalidate
   * @description Time in seconds where a stale value may be used while a fresh value is being fetched
   * @default 60 // 1 minute
   */
  swr?: number;
  /**
   * Cleanup interval
   * @description Interval in seconds at which to check and delete expired keys, set to -1 to disable
   * @default 1,800 // 30 minutes
   */
  cleanup?: number;
}

/** Creates a hash of the key and args */
export function resolveKey<F extends CachedFunctions, K extends keyof F>(key: K, args: Parameters<F[K]>) {
  return hash("sha1", `${key.toString()}:${JSON.stringify(args)}`);
}

/** A super simple cache system using a map */
export function defaultLogic<F extends CachedFunctions>(config: Config = {}): DefaultLogic<F> {
  const cache = new Map<
    string,
    {
      swr: number;
      value: unknown;
      expiresAt: number;
    }
  >();

  if (config.cleanup !== -1) {
    setInterval(
      () => {
        for (const [key, { expiresAt, swr }] of cache.entries()) {
          if (expiresAt + swr < Date.now()) {
            cache.delete(key);
          }
        }
      },
      (config.cleanup ?? 30 * 60) * 1000,
    );
  }

  return {
    get(key) {
      const data = cache.get(key);
      if (!data || data.expiresAt + data.swr < Date.now()) {
        return { state: "miss" };
      }
      return {
        state: data.expiresAt < Date.now() ? "stale" : "hit",
        value: data.value,
      };
    },
    set(key, value) {
      cache.set(key, {
        value,
        swr: (config.swr ?? 60) * 1000,
        expiresAt: Date.now() + (config.ttl ?? 5 * 60) * 1000,
      });
    },
    delete: cache.delete,
    resolveKey,
  };
}
