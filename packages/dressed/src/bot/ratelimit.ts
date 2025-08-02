import ora from "ora";

const limits = new Map<string, { remaining: number; resetAt: number }>();

async function delayUntil(time: number) {
  const delayDuration = Math.max(0, time - Date.now());
  await new Promise((resolve) => setTimeout(resolve, delayDuration));
}

export async function checkLimit(endpoint: string) {
  const globalLimit = limits.get("global");
  const endpointLimit = limits.get(endpoint);
  if (globalLimit) {
    if (Date.now() > globalLimit.resetAt) {
      limits.delete("global");
      return;
    }
    if (globalLimit.remaining === 0) {
      const waiting = ora(
        "Global rate limit reached! - Waiting to try again...",
      ).start();
      await delayUntil(globalLimit.resetAt);
      limits.delete("global");
      waiting.warn(
        "A request was delayed because you hit the global rate limit",
      );
    } else if (globalLimit.remaining === 1) {
      ora("You are about to hit the global rate limit!").warn();
    }
  } else if (endpointLimit) {
    if (Date.now() > endpointLimit.resetAt) {
      limits.delete(endpoint);
      return;
    }
    if (endpointLimit.remaining === 0) {
      const waiting = ora(
        `Rate limit for ${endpoint} reached! - Waiting to try again...`,
      ).start();
      await delayUntil(endpointLimit.resetAt);
      limits.delete(endpoint);
      waiting.warn(
        `A request was delayed because you hit the rate limit for ${endpoint}`,
      );
    } else if (endpointLimit.remaining === 1) {
      ora(`You are about to hit the rate limit for ${endpoint}!`).warn();
    }
  }
}

export function headerUpdateLimit(endpoint: string, res: Response) {
  const remaining = res.headers.get("x-ratelimit-remaining");
  const resetAt = res.headers.get("x-ratelimit-reset");
  if (remaining) {
    limits.set(endpoint, {
      remaining: Number(remaining),
      resetAt: Number(resetAt) * 1000,
    });
  }
}

export function updateLimit(
  endpoint: string,
  remaining: number,
  resetAt: number,
) {
  limits.set(endpoint, { remaining, resetAt });
}
