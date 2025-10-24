interface Bucket {
  remaining: number;
  limit: number;
  queue: (() => void)[];
  refresh: number;
  sweeper?: NodeJS.Timeout;
}

const buckets = new Map<string, Bucket>();
const bucketIds = new Map<string, string>();

let globalReset = -1;

function checkGlobalLimit() {
  const deltaG = globalReset - Date.now();
  if (deltaG > 0) return new Promise<void>((r) => setTimeout(r, deltaG));
}

function ensureBucket(id: string) {
  const bucketId = bucketIds.get(id) ?? id;
  return (
    buckets.get(bucketId) ??
    // biome-ignore lint/style/noNonNullAssertion: We're setting, so it's guaranteed
    buckets.set(bucketId, { limit: 1, remaining: 1, queue: [], refresh: -1 }).get(bucketId)!
  );
}

export function checkLimit(req: Request) {
  const bucket = ensureBucket(`${req.method}:${req.url}`);
  if (bucket.remaining-- > 0 && bucket.refresh < Date.now()) return checkGlobalLimit();
  return new Promise<void>((r) => bucket.queue.push(r));
}

export function updateLimit(req: Request, res: Response) {
  const bucketId = res.headers.get("x-ratelimit-bucket");
  const limit = parseInt(res.headers.get("x-ratelimit-limit") ?? "", 10);
  const remaining = parseInt(res.headers.get("x-ratelimit-remaining") ?? "", 10);
  const resetAfter = parseFloat(res.headers.get("x-ratelimit-reset-after") ?? "");
  const retryAfter = parseFloat(res.headers.get("retry-after") ?? "");
  const scope = res.headers.get("x-ratelimit-scope");
  const id = `${req.method}:${req.url}`;
  const tmpBucket = buckets.get(id);
  const now = Date.now();
  const refreshAfter = (Number.isNaN(retryAfter) ? resetAfter : retryAfter) * 1000;
  buckets.delete(id);

  if (scope === "global" && !Number.isNaN(retryAfter)) {
    globalReset = now + retryAfter * 1000;
    return;
  }
  if ([limit, remaining, resetAfter].some(Number.isNaN) || !bucketId) return;

  const release = async () => {
    const bucket = buckets.get(bucketId);
    if (!bucket) return;
    const callback = bucket.queue.shift();
    if (callback) {
      --bucket.remaining;
      await checkGlobalLimit();
      callback();
    }
  };

  bucketIds.set(id, bucketId);
  const bucket = buckets.get(bucketId);

  clearTimeout(bucket?.sweeper);
  buckets.set(bucketId, {
    limit,
    remaining,
    queue: (bucket?.queue ?? []).concat(tmpBucket?.queue ?? []),
    refresh: now + refreshAfter,
    sweeper: setTimeout(() => {
      const bucket = buckets.get(bucketId);
      if (!bucket || globalReset > Date.now()) return;
      bucket.remaining = bucket.limit;
      release();
    }, refreshAfter),
  });
  if (remaining > 0) release();
}
