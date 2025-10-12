interface Bucket {
  remaining: number;
  limit: number;
  queue: (() => void)[];
  sweeper?: NodeJS.Timeout;
  tmp?: true;
}

const buckets = new Map<string, Bucket>();
const bucketIds = new Map<string, string>();

function ensureBucket(id: string) {
  const bucketId = bucketIds.get(id) ?? id;
  return (
    buckets.get(bucketId) ??
    // biome-ignore lint/style/noNonNullAssertion: We're setting, so it's guaranteed
    buckets.set(bucketId, { limit: 1, remaining: 1, queue: [], tmp: true }).get(bucketId)!
  );
}

export async function checkLimit(req: Request) {
  const bucket = ensureBucket(`${req.method}:${req.url}`);
  if (bucket.remaining-- > 0 && bucket.tmp) return;
  return new Promise<void>((r) => bucket.queue.push(r));
}

const reqing: Record<string, () => void> = {};

export function updateLimit(req: Request, res: Response) {
  const bucketId = res.headers.get("x-ratelimit-bucket") ?? "global";
  const limit = parseInt(res.headers.get("x-ratelimit-limit") ?? "", 10);
  const remaining = parseInt(res.headers.get("x-ratelimit-remaining") ?? "", 10);
  const resetAfter = parseFloat(res.headers.get("x-ratelimit-reset-after") ?? "");
  const retryAfter = parseFloat(res.headers.get("retry-after") ?? "");

  if ([limit, remaining, resetAfter].some(Number.isNaN)) return;

  const id = `${req.method}:${req.url}`;
  bucketIds.set(id, bucketId);
  const bucket = buckets.get(bucketId);
  const tmpBucket = buckets.get(id);
  buckets.delete(id);

  function sweep() {
    const bucket = buckets.get(bucketId);
    if (!bucket) return;
    bucket.remaining = bucket.limit;
    trial();
  }

  async function trial() {
    const bucket = buckets.get(bucketId);
    if (!bucket) return;
    const callback = bucket.queue.shift();
    if (callback) {
      --bucket.remaining;
      callback();
      await new Promise<void>((r) => {
        reqing[bucketId] = r;
      });
      if (bucket.remaining > 0) trial();
    }
  }

  clearTimeout(bucket?.sweeper);
  buckets.set(bucketId, {
    limit,
    remaining,
    queue: [...(tmpBucket?.queue ?? []), ...(bucket?.queue ?? [])],
    sweeper: !tmpBucket ? setTimeout(sweep, (Number.isNaN(retryAfter) ? resetAfter : retryAfter) * 1000) : undefined,
  });
  reqing[bucketId]?.();
  if (tmpBucket) trial();
}
