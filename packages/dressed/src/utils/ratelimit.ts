import ora from "ora";

const buckets = new Map<string, { remaining: number; resetAt: number }>();
const endpoints = new Map<string, string>();

export async function checkLimit(endpoint: string, method = "") {
  const bucket = endpoints.get(method + endpoint);
  if (!bucket) return;
  const limit = buckets.get(bucket);
  if (endpoint === "global") endpoint = "all endpoints";
  else await checkLimit("global");
  if (limit) {
    if (Date.now() > limit.resetAt) {
      buckets.delete(bucket);
      return;
    }
    if (limit.remaining === 0) {
      const waiting = ora(
        `Rate limit for ${endpoint} reached! - Waiting to try again...`,
      ).start();
      await new Promise((r) =>
        setTimeout(r, Math.max(0, limit.resetAt - Date.now())),
      );
      buckets.delete(bucket);
      waiting.warn(
        `A request was delayed because you hit the rate limit for ${endpoint}`,
      );
    } else if (limit.remaining === 1) {
      ora(`You are about to hit the rate limit for ${endpoint}`).warn();
    }
  }
}

export function headerUpdateLimit(
  endpoint: string,
  res: Response,
  method = "",
) {
  const remaining = res.headers.get("x-ratelimit-remaining");
  const resetAt = res.headers.get("x-ratelimit-reset");
  const bucket = res.headers.get("x-ratelimit-bucket");
  if (remaining && bucket) {
    updateLimit(bucket, Number(remaining), Number(resetAt) * 1000);
    endpoints.set(method + endpoint, bucket);
  }
}

export function updateLimit(
  bucket: string,
  remaining: number,
  resetAt: number,
) {
  buckets.set(bucket, { remaining, resetAt });
}
