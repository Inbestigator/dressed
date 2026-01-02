import { setTimeout } from "node:timers";

interface Bucket {
  remaining: number;
  limit: number;
  refresh: number;
  enqueued: Request[];
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
      enqueued: [],
      promise: Promise.resolve(),
    });
  }
  const bucket = buckets.get(bucketId) as Bucket;
  // Runtimes like CF workers persist global state between requests except promises -> null
  if (bucket.promise === null) {
    bucket.promise = Promise.resolve();
    bucket.enqueued = [];
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
          return resolveRequest();
        }
        if ([limit, remaining, resetAfter].some(Number.isNaN) || !bucketId) return resolveRequest();

        bucketIds.set(bucketIdKey, bucketId);

        const bucket = ensureBucket(bucketIdKey);

        bucket.limit = limit;
        bucket.remaining = remaining;
        bucket.refresh = Date.now() + refreshAfter;
        bucket.promise = tmpBucket ? bucket.promise.then(() => tmpBucket.promise) : bucket.promise; // NOSONAR

        clearTimeout(bucket.cleaner);
        if (bucketTTL !== -1) {
          bucket.cleaner = setTimeout(cleanup(bucketId), bucketTTL * 1000).unref();
        }

        resolveRequest();
      });

      return new Promise<void>((r) => {
        resolveRequest = r;
      });
    });
  });
}

async function combineReqs(...reqs: Request[]): Promise<Request[]> {
  const groups = new Map<string | null, Request[]>();

  for (const r of reqs) {
    const k = r.headers.get("authorization");
    (groups.get(k) ?? groups.set(k, []).get(k))?.push(r);
  }

  return Promise.all(
    [...groups.values()].map(async (group) => {
      const payload = {};
      let lastForm: FormData | null = null;

      for (const r of group) {
        const ct = r.headers.get("content-type") ?? "";

        if (ct.includes("multipart/form-data") || r.body instanceof FormData) {
          lastForm = new FormData();
          for (const [k, v] of (await r.clone().formData()).entries()) {
            k === "payload_json" ? Object.assign(payload, JSON.parse(String(v))) : lastForm.append(k, v);
          }
        } else {
          Object.assign(payload, await r.clone().json());
        }
      }

      const body = lastForm ?? JSON.stringify(payload);
      if (lastForm) lastForm.set("payload_json", JSON.stringify(payload));

      const headers = new Headers(group[0].headers);
      if (lastForm) headers.delete("content-type");
      else headers.set("content-type", "application/json");

      return new Request(group[0].url, {
        method: group[0].method,
        headers,
        body,
      });
    }),
  );
}
