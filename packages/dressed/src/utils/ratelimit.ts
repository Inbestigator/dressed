interface Bucket {
  remaining: number;
  limit: number;
  queue: [Request, (r: (v: Response) => void) => void][];
  refresh: number;
  outstanding: boolean;
}

export const buckets: Record<string, Bucket> = {};
export const bucketIds: Record<string, string> = {};

let globalReset = -1;

function ensureBucket(id: string) {
  const bucketId = bucketIds[id] ?? id;
  if (!(bucketId in buckets)) {
    buckets[bucketId] = { limit: 1, remaining: 1, queue: [], refresh: -1, outstanding: false };
  }
  return buckets[bucketId];
}

async function release(bucket: Bucket, req: Request) {
  const next = bucket.queue.shift();
  if (next) {
    const [nextReq, callback] = next;
    bucket.outstanding = true;
    const now = Date.now();
    const deltaB = bucket.refresh - now;
    const deltaG = globalReset - now;
    if (bucket.remaining-- === 0 || deltaG > 0) {
      await new Promise<void>((r) =>
        setTimeout(() => {
          bucket.remaining = bucket.limit - 1;
          r();
        }, Math.max(0, deltaG, deltaB))
      );
    }
    callback((res) => {
      const bucketIdKey = `${req.method}:${req.url}`;
      const bucketId = res.headers.get("x-ratelimit-bucket");
      const limit = parseInt(res.headers.get("x-ratelimit-limit") ?? "", 10);
      const remaining = parseInt(res.headers.get("x-ratelimit-remaining") ?? "", 10);
      const resetAfter = parseFloat(res.headers.get("x-ratelimit-reset-after") ?? "");
      const retryAfter = parseFloat(res.headers.get("retry-after") ?? "");
      const scope = res.headers.get("x-ratelimit-scope");
      const now = Date.now();
      const refreshAfter = (Number.isNaN(retryAfter) ? resetAfter : retryAfter) * 1000;
      const tmpBucket = buckets[bucketIdKey];
      delete buckets[bucketIdKey];

      if (scope === "global" && !Number.isNaN(retryAfter)) {
        globalReset = now + retryAfter * 1000;
        return;
      }
      if ([limit, remaining, resetAfter].some(Number.isNaN) || !bucketId) return;

      bucketIds[bucketIdKey] = bucketId;
      const bucket = buckets[bucketId];

      const newBucket = {
        limit,
        remaining,
        queue: (bucket?.queue ?? []).concat(tmpBucket?.queue ?? []),
        refresh: now + refreshAfter,
        outstanding: false,
      };

      buckets[bucketId] = newBucket;
      console.log("Released after");
      release(newBucket, nextReq);
    });
  }
}

export function checkLimit(req: Request) {
  const bucket = ensureBucket(`${req.method}:${req.url}`);
  console.log(bucket);
  return new Promise<Parameters<Bucket["queue"][number][1]>[0]>((r) => {
    bucket.queue.push([req, r]);
    if (!bucket.outstanding) {
      console.log("Released first");
      release(bucket, req);
    }
  });
}
