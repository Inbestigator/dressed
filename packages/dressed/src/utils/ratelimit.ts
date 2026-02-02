import { setTimeout } from "node:timers";

type ExtractedBodyType = object | FormData;

interface Collector {
  key: string;
  bodies: Promise<ExtractedBodyType>[];
  promise: Promise<Response>;
  resolve: (r: Response) => void;
  prev: { processReq: (r: Request, cb?: (r: Response) => void) => Promise<undefined>; req: Request };
}

interface Bucket {
  remaining: number;
  limit: number;
  refresh: number;
  promise: Promise<Collector | undefined> & { thened?: () => void };
  cleaner?: NodeJS.Timeout;
}

export const buckets = new Map<string, Bucket>();
export const bucketIds = new Map<string, string>();
export const resets = { global: -1 };

function ensureBucket(id: string) {
  const bucketId = bucketIds.get(id) ?? id;
  if (!buckets.has(bucketId)) {
    buckets.set(bucketId, { limit: 1, remaining: 1, refresh: -1, promise: Promise.resolve(undefined) });
  }
  const bucket = buckets.get(bucketId) as Bucket;
  // Runtimes like CF workers persist global state between requests except promises -> null
  bucket.promise ??= Promise.resolve(undefined);

  return bucket;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const cleanup = (bucketId: string) => () => {
  buckets.delete(bucketId);
  for (const [k, v] of bucketIds) {
    if (v === bucketId) bucketIds.delete(k);
  }
};

export function checkLimit(req: Request, bucketTTL: number) {
  return new Promise<[Request, (v: Response) => void] | Response>((resolveChecker) => {
    const auth = req.headers.get("authorization");
    const bucketIdKey = `${req.method}:${new URL(req.url).pathname}:${auth}`;
    const bucket = ensureBucket(bucketIdKey);

    async function processReq(req: Request, cb?: (res: Response) => void) {
      const deltaG = resets.global - Date.now();

      if (deltaG > 0) {
        await delay(deltaG);
      }

      const bucket = ensureBucket(bucketIdKey);
      const deltaB = bucket.refresh - Date.now();

      if (bucket.remaining-- === 0) {
        await delay(Math.max(0, deltaB));
        bucket.remaining = bucket.limit - 1;
      }

      let resolveRequest: (v: undefined) => void;

      resolveChecker([
        req,
        (res) => {
          cb?.(res.clone());
          let bucketId = res.headers.get("x-ratelimit-bucket");
          const limit = Number.parseInt(res.headers.get("x-ratelimit-limit") ?? "", 10);
          const remaining = Number.parseInt(res.headers.get("x-ratelimit-remaining") ?? "", 10);
          const resetAfter = Number.parseFloat(res.headers.get("x-ratelimit-reset-after") ?? "");
          const retryAfter = Number.parseFloat(res.headers.get("retry-after") ?? "");
          const scope = res.headers.get("x-ratelimit-scope");
          const refreshAfter = (Number.isNaN(retryAfter) ? resetAfter : retryAfter) * 1000;
          const tmpBucket = buckets.get(bucketIdKey);

          buckets.delete(bucketIdKey);

          if (scope === "global" && !Number.isNaN(retryAfter)) {
            resets.global = Date.now() + retryAfter * 1000;
            return resolveRequest(undefined);
          }
          if ([limit, remaining, resetAfter].some(Number.isNaN) || !bucketId) return resolveRequest(undefined);

          bucketId += `:${auth}`;
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

          resolveRequest(undefined);
        },
      ]);

      return new Promise<undefined>((r) => {
        resolveRequest = r;
      });
    }

    function collectReq(collector: Partial<Collector> & Omit<Collector, "prev">, req: Request) {
      collector.promise = collector.promise.then((r) => {
        resolveChecker(r.clone());
        return r;
      });
      if (req.method !== "GET") {
        const ct = req.headers.get("content-type") ?? "";
        collector.bodies.push(
          req[ct.includes("multipart/form-data") || req.body instanceof FormData ? "formData" : "json"](),
        );
      }
      collector.prev = { processReq, req };
      return collector as Collector;
    }

    let isLast = true;
    bucket.promise.thened?.();
    bucket.promise = Object.assign(
      bucket.promise
        .then(async (collector) => {
          if (collector) {
            if (collector.key === bucketIdKey) collector = collectReq(collector, req);
            if (isLast || collector.key !== bucketIdKey) {
              const { prev } = collector;
              return prev.processReq(
                prev.req.method === "GET" ? prev.req : combineBodies(await Promise.all(collector.bodies), prev.req),
                collector.resolve,
              );
            }
            return collector;
          }
          if ((req.method === "PATCH" || req.method === "GET") && !isLast) {
            let resolve!: Collector["resolve"];
            const promise = new Promise<Response>((r) => {
              resolve = r;
            });
            return collectReq({ key: bucketIdKey, bodies: [], promise, resolve }, req);
          }
        })
        .then((c) => c ?? processReq(req)),
      {
        thened() {
          isLast = false;
        },
      },
    );
  });
}

function combineBodies(bodies: ExtractedBodyType[], { url, method, headers }: Request) {
  const payload = {};
  let lastForm: FormData | undefined;

  for (const body of bodies) {
    if (body instanceof FormData) {
      lastForm = body;
      const jsonPayload = body.get("payload_json");
      if (jsonPayload) {
        Object.assign(payload, JSON.parse(jsonPayload as string));
      }
    } else {
      Object.assign(payload, body);
    }
  }

  const body = lastForm ?? JSON.stringify(payload);

  if (lastForm) {
    lastForm.set("payload_json", JSON.stringify(payload));
    headers.delete("content-type");
  } else {
    headers.set("content-type", "application/json");
  }

  return new Request(url, { method, headers, body });
}
