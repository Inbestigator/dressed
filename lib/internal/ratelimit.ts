import ora from "ora";

const limits = new Map<string, { remaining: number; resetAt: number }>();

export async function checkLimit(endpoint: string) {
  async function delayUntil(time: number) {
    const delayDuration = Math.max(0, time - Date.now());
    await new Promise((resolve) => setTimeout(resolve, delayDuration));
  }

  const globalLimit = limits.get("global");
  const endpointLimit = limits.get(endpoint);
  if (globalLimit) {
    if (globalLimit.remaining === 0) {
      ora(`You have hit the global rate limit!\nWaiting to try again...`)
        .warn();
      await delayUntil(globalLimit.resetAt);
      limits.delete("global");
    } else if (globalLimit.remaining < 2) {
      ora("You are about to hit the global rate limit!").warn();
    }
  } else if (
    endpointLimit
  ) {
    if (endpointLimit.remaining === 0) {
      ora(
        `You have hit the rate limit for ${endpoint}!\nWaiting to try again...`,
      ).warn();
      await delayUntil(endpointLimit.resetAt);
      limits.delete(endpoint);
    } else if (endpointLimit.remaining < 2) {
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
