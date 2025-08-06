import ora from "ora";

const buckets = new Map<string, { remaining: number; resetAt: number }>();
const endpoints = new Map<string, string>();

async function delayUntil(time: number) {
  const delayDuration = Math.max(0, time - Date.now());
  await new Promise((resolve) => setTimeout(resolve, delayDuration));
}

export async function checkLimit(endpoint: string, method = "") {
  const bucket = endpoints.get(method + endpoint);
  if (!bucket) return;
  const globalLimit = buckets.get("global");
  const endpointLimit = buckets.get(bucket);
  if (globalLimit) {
    if (Date.now() > globalLimit.resetAt) {
      buckets.delete("global");
      return;
    }
    if (globalLimit.remaining === 0) {
      const waiting = ora("Global rate limit reached! - Waiting to try again...").start();
      await delayUntil(globalLimit.resetAt);
      buckets.delete("global");
      waiting.warn("A request was delayed because you hit the global rate limit");
    } else if (globalLimit.remaining === 1) {
      ora("You are about to hit the global rate limit!").warn();
    }
  } else if (endpointLimit) {
    if (Date.now() > endpointLimit.resetAt) {
      buckets.delete(bucket);
      return;
    }
    if (endpointLimit.remaining === 0) {
      const waiting = ora(`Rate limit for ${endpoint} reached! - Waiting to try again...`).start();
      await delayUntil(endpointLimit.resetAt);
      buckets.delete(bucket);
      waiting.warn(`A request was delayed because you hit the rate limit for ${endpoint}`);
    } else if (endpointLimit.remaining === 1) {
      ora(`You are about to hit the rate limit for ${endpoint}!`).warn();
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
