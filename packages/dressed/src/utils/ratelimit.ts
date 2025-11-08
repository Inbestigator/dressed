import { setTimeout } from "node:timers";
import { serverConfig } from "./env.ts";

interface Bucket {
  remaining: number;
  limit: number;
  refresh: number;
  promise: Promise<void>;
  cleaner?: NodeJS.Timeout;
}

export const buckets = new Map<string, Bucket>();
export const bucketIds = new Map<string, string>();

let globalReset = -1;

function ensureBucket(id: string) {
  const bucketId = bucketIds.get(id) ?? id;
  if (!buckets.has(bucketId)) {
    buckets.set(bucketId, {
      limit: 1,
      remaining: 1,
      refresh: -1,
      promise: Promise.resolve(),
    });
  }
  const bucket = buckets.get(bucketId) as Bucket;
  // Runtimes like CF workers persist global state between requests except promises -> null
  if (!bucket.promise) bucket.promise = Promise.resolve();

  const { bucketCleanup = 30 * 60 } = serverConfig.requests ?? {};
  if (bucketCleanup !== -1) {
    clearTimeout(bucket.cleaner);
    bucket.cleaner = setTimeout(() => {
      buckets.delete(id);
      bucketIds.forEach((v, k) => {
        v === id && bucketIds.delete(k);
      });
    }, bucketCleanup * 1000).unref();
  }

  return bucket;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function checkLimit(req: Request) {
  return new Promise<(v: Response) => void>((resolveChecker) => {
    const bucketIdKey = `${req.method}:${req.url}`;
    const bucket = ensureBucket(bucketIdKey);
    bucket.promise = bucket.promise.then(async () => {
      const deltaG = globalReset - Date.now();

      if (deltaG > 0) {
        await delay(deltaG);
      }

      const bucket = ensureBucket(bucketIdKey);
      const deltaB = bucket.refresh - Date.now();

      if (bucket.remaining-- === 0) {
        await delay(Math.max(0, deltaB));
        bucket.remaining = bucket.limit - 1;
      }

      let resolveRequest: () => void;

      resolveChecker((res) => {
        const bucketId = res.headers.get("x-ratelimit-bucket");
        const limit = parseInt(res.headers.get("x-ratelimit-limit") ?? "", 10);
        const remaining = parseInt(res.headers.get("x-ratelimit-remaining") ?? "", 10);
        const resetAfter = parseFloat(res.headers.get("x-ratelimit-reset-after") ?? "");
        const retryAfter = parseFloat(res.headers.get("retry-after") ?? "");
        const scope = res.headers.get("x-ratelimit-scope");
        const refreshAfter = (Number.isNaN(retryAfter) ? resetAfter : retryAfter) * 1000;
        const tmpBucket = buckets.get(bucketIdKey);

        buckets.delete(bucketIdKey);

        if (scope === "global" && !Number.isNaN(retryAfter)) {
          globalReset = Date.now() + retryAfter * 1000;
          return resolveRequest();
        }
        if ([limit, remaining, resetAfter].some(Number.isNaN) || !bucketId) return resolveRequest();

        bucketIds.set(bucketIdKey, bucketId);

        const bucket = ensureBucket(bucketIdKey);

        bucket.limit = limit;
        bucket.remaining = remaining;
        bucket.refresh = Date.now() + refreshAfter;
        bucket.promise = tmpBucket ? bucket.promise.then(() => tmpBucket.promise) : bucket.promise;

        resolveRequest();
      });

      return new Promise<void>((r) => {
        resolveRequest = r;
      });
    });
  });
}
