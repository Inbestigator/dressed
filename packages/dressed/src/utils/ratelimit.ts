interface Bucket {
  remaining: number;
  limit: number;
  refresh: number;
  promise: Promise<void>;
}

export const buckets: Record<string, Bucket> = {};
export const bucketIds: Record<string, string> = {};

let globalReset = -1;

function ensureBucket(id: string) {
  const bucketId = bucketIds[id] ?? id;
  if (!(bucketId in buckets)) {
    buckets[bucketId] = { limit: 1, remaining: 1, refresh: -1, promise: Promise.resolve() };
  }
  const bucket = buckets[bucketId];
  if (!bucket.promise) bucket.promise = Promise.resolve();
  return bucket;
}

export function checkLimit(req: Request) {
  return new Promise<(v: Response) => void>((resolveChecker) => {
    const { promise, resolve: resolveRequest } = Promise.withResolvers<void>();
    const bucketIdKey = `${req.method}:${req.url}`;
    const bucket = ensureBucket(bucketIdKey);
    bucket.promise = bucket.promise.then(async () => {
      const bucket = ensureBucket(bucketIdKey);
      const deltaG = globalReset - Date.now();

      if (deltaG > 0) {
        await new Promise<void>((resolveTimeout) => setTimeout(resolveTimeout, deltaG));
      }

      const deltaB = bucket.refresh - Date.now();

      if (bucket.remaining-- === 0) {
        await new Promise<void>((resolveTimeout) =>
          setTimeout(
            () => {
              bucket.remaining = bucket.limit - 1;
              resolveTimeout();
            },
            Math.max(0, deltaB),
          ),
        );
      }

      resolveChecker((res) => {
        const bucketId = res.headers.get("x-ratelimit-bucket");
        const limit = parseInt(res.headers.get("x-ratelimit-limit") ?? "", 10);
        const remaining = parseInt(res.headers.get("x-ratelimit-remaining") ?? "", 10);
        const resetAfter = parseFloat(res.headers.get("x-ratelimit-reset-after") ?? "");
        const retryAfter = parseFloat(res.headers.get("retry-after") ?? "");
        const scope = res.headers.get("x-ratelimit-scope");
        const refreshAfter = (Number.isNaN(retryAfter) ? resetAfter : retryAfter) * 1000;
        const tmpBucket = buckets[bucketIdKey];

        delete buckets[bucketIdKey];

        if (scope === "global" && !Number.isNaN(retryAfter)) {
          globalReset = Date.now() + retryAfter * 1000;
          return;
        }
        if ([limit, remaining, resetAfter].some(Number.isNaN) || !bucketId) return;

        bucketIds[bucketIdKey] = bucketId;

        const bucketPromise = ensureBucket(bucketIdKey).promise;

        buckets[bucketId] = {
          limit,
          remaining,
          refresh: Date.now() + refreshAfter,
          promise: tmpBucket ? bucketPromise.then(() => tmpBucket.promise) : bucketPromise,
        };

        resolveRequest();
      });

      return promise;
    });
  });
}
