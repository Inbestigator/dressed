import spinner from "yocto-spinner";

const buckets = new Map<string, { remaining: number; resetAt: number }>();
const endpoints = new Map<string, string>();

export async function checkLimit(endpoint: string, method = "") {
  if (endpoint !== "global") await checkLimit("global");
  const bucket = endpoints.get(method + endpoint);
  if (!bucket) return;
  const limit = buckets.get(bucket);
  if (limit) {
    if (Date.now() > limit.resetAt) {
      buckets.delete(bucket);
      return;
    }
    const displayed = endpoint === "global" ? "all endpoints" : endpoint;
    if (limit.remaining === 0) {
      const waiting = spinner().start(`Rate limit for ${displayed} reached! - waiting to try again...`);
      await new Promise((r) => setTimeout(r, Math.max(0, limit.resetAt - Date.now())));
      buckets.delete(bucket);
      waiting.warning(`A request was delayed because you hit the rate limit for ${displayed}`);
    } else if (limit.remaining === 1) {
      spinner().warning(`You are about to hit the rate limit for ${displayed}`);
    }
  }
}

export function headerUpdateLimit(endpoint: string, res: Response, method = "") {
  const remaining = res.headers.get("x-ratelimit-remaining");
  const resetAt = res.headers.get("x-ratelimit-reset");
  const bucket = res.headers.get("x-ratelimit-bucket");
  if (remaining && bucket) {
    updateLimit(bucket, Number(remaining), Number(resetAt) * 1000);
    endpoints.set(method + endpoint, bucket);
  }
}

export function updateLimit(bucket: string, remaining: number, resetAt: number) {
  buckets.set(bucket, { remaining, resetAt });
}
