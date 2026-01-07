import { setTimeout } from "node:timers";

interface Bucket {
  remaining: number;
  limit: number;
  refresh: number;
  queued: Request[];
  promise: Promise<number>;
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
      queued: [],
      promise: Promise.resolve(0),
    });
  }
  const bucket = buckets.get(bucketId) as Bucket;
  // Runtimes like CF workers persist global state between requests except promises -> null
  if (bucket.promise === null) {
    bucket.promise = Promise.resolve(0);
    bucket.queued = [];
  }

  return bucket;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const cleanup = (bucketId: string) => () => {
  buckets.delete(bucketId);
  for (const [k, v] of bucketIds) {
    if (v === bucketId) bucketIds.delete(k);
  }
};

export function checkLimit(req: Request, bucketTTL: number) {
  return new Promise<[(v: Response) => void, Request]>((resolveChecker) => {
    const bucketIdKey = `${req.method}:${req.url}`;
    const bucket = ensureBucket(bucketIdKey);
    bucket.queued.push(req);
    bucket.promise = bucket.promise.then(async (r) => {
      if (r-- > 0) return r;

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

      let resolveRequest: (n: number) => void;

      const { next, combined } = req.method === "PATCH" ? await combineReqs(bucket.queued) : { next: req, combined: 1 };
      bucket.queued = bucket.queued.slice(combined);

      resolveChecker([
        (res) => {
          const bucketId = res.headers.get("x-ratelimit-bucket");
          const limit = Number.parseInt(res.headers.get("x-ratelimit-limit") ?? "", 10);
          const remaining = Number.parseInt(res.headers.get("x-ratelimit-remaining") ?? "", 10);
          const resetAfter = Number.parseFloat(res.headers.get("x-ratelimit-reset-after") ?? "");
          const retryAfter = Number.parseFloat(res.headers.get("retry-after") ?? "");
          const scope = res.headers.get("x-ratelimit-scope");
          const refreshAfter = (Number.isNaN(retryAfter) ? resetAfter : retryAfter) * 1000;
          const tmpBucket = buckets.get(bucketIdKey);

          buckets.delete(bucketIdKey);

          if (scope === "global" && !Number.isNaN(retryAfter)) {
            globalReset = Date.now() + retryAfter * 1000;
            return resolveRequest(combined - 1);
          }
          if ([limit, remaining, resetAfter].some(Number.isNaN) || !bucketId) return resolveRequest(combined - 1);

          bucketIds.set(bucketIdKey, bucketId);

          const bucket = ensureBucket(bucketIdKey);

          bucket.limit = limit;
          bucket.remaining = remaining;
          bucket.refresh = Date.now() + refreshAfter;
          bucket.promise = tmpBucket ? bucket.promise.then(() => tmpBucket.promise) : bucket.promise; // NOSONAR
          bucket.queued = tmpBucket ? bucket.queued.concat(tmpBucket.queued) : bucket.queued;

          clearTimeout(bucket.cleaner);
          if (bucketTTL !== -1) {
            bucket.cleaner = setTimeout(cleanup(bucketId), bucketTTL * 1000).unref();
          }

          resolveRequest(combined - 1);
        },
        next,
      ]);

      return new Promise<number>((r) => {
        resolveRequest = r;
      });
    });
  });
}

async function combineReqs(reqs: Request[]): Promise<{ next: Request; combined: number }> {
  const group: Request[] = [];

  const payload = {};
  let lastForm: FormData | undefined;

  for (const r of reqs) {
    if (r.headers.get("authorization") !== reqs[0].headers.get("authorization") || r.url !== reqs[0].url) break;

    group.push(r);

    const ct = r.headers.get("content-type") ?? "";

    if (ct.includes("multipart/form-data") || r.body instanceof FormData) {
      lastForm = await r.clone().formData();
      const jsonPayload = lastForm.get("payload_json");
      if (jsonPayload) {
        Object.assign(payload, JSON.parse(jsonPayload as string));
      }
    } else {
      Object.assign(payload, await r.clone().json());
    }
  }

  const body = lastForm ?? JSON.stringify(payload);

  const { headers } = group[0];

  if (lastForm) {
    lastForm.set("payload_json", JSON.stringify(payload));
    headers.delete("content-type");
  } else {
    headers.set("content-type", "application/json");
  }

  return {
    next: new Request(group[0].url, {
      method: group[0].method,
      headers,
      body,
    }),
    combined: group.length,
  };
}
