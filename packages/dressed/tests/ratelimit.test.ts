import { afterAll, beforeAll, expect, test } from "bun:test";
import { createMessage } from "dressed";

interface Bucket {
  resetAt: number;
  remaining: number;
  limit: number;
}

let server: Bun.Server<undefined>;

beforeAll(() => {
  const buckets = new Map<string, Bucket>();

  let globalRemaining = 5;
  let globalResetAt = Date.now() + 1400;

  function getBucket(endpoint: string): Bucket {
    const now = Date.now();
    let bucket = buckets.get(endpoint);
    if (!bucket) {
      bucket = { resetAt: now + 200, remaining: 1, limit: 1 };
      buckets.set(endpoint, bucket);
    }

    if (now >= bucket.resetAt) {
      bucket.remaining = bucket.limit;
      bucket.resetAt = now + 200;
    }

    return bucket;
  }

  function checkGlobalLimit() {
    const now = Date.now();

    if (now >= globalResetAt) {
      globalRemaining = 1;
      globalResetAt = now + 600;
    }

    return globalRemaining-- > 0;
  }

  server = Bun.serve({
    port: 6556,
    fetch(req) {
      const endpoint = req.url.toString();
      const now = Date.now();

      if (!checkGlobalLimit()) {
        const retryAfter = (globalResetAt - now) / 1000;
        const headers = new Headers({
          "Retry-After": retryAfter.toFixed(0),
          "X-RateLimit-Global": "true",
          "X-RateLimit-Scope": "global",
        });
        return new Response(
          JSON.stringify({
            message: "You are being rate limited.",
            retry_after: retryAfter,
            global: true,
          }),
          { status: 429, headers },
        );
      }

      const bucket = getBucket(endpoint);
      const headers = new Headers({
        "X-RateLimit-Limit": bucket.limit.toString(),
        "X-RateLimit-Remaining": Math.max(bucket.remaining - 1, 0).toString(),
        "X-RateLimit-Reset-After": ((bucket.resetAt - now) / 1000).toFixed(3),
        "X-RateLimit-Bucket": endpoint,
      });

      if (bucket.remaining-- <= 0) {
        const retryAfter = (bucket.resetAt - now) / 1000;
        headers.set("Retry-After", retryAfter.toFixed(0));
        return new Response(
          JSON.stringify({
            message: "You are being rate limited.",
            retry_after: retryAfter,
            global: false,
          }),
          { status: 429, headers },
        );
      }

      return new Response(JSON.stringify({ content: "test" }), { status: 200, headers });
    },
  });
});

afterAll(() => server.stop());

// Normally tries defaults to 3, but for the purposes of these tests there shouldn't be any wiggle room

test("Ratelimit delaying", () => {
  expect(
    Promise.all(
      Array.from({ length: 5 }, () =>
        createMessage("wait_for_me", "test", { tries: 0, authorization: "", baseURL: "http://localhost:6556" }),
      ),
    ),
  ).resolves.toMatchSnapshot();
});

test("Globally ratelimited and thrown", () => {
  expect(
    createMessage("limit_me", "test", { tries: 0, authorization: "", baseURL: "http://localhost:6556" }),
  ).rejects.toThrowErrorMatchingSnapshot();
});

test("Globally ratelimited and delayed", async () => {
  expect(
    createMessage("delay_me", "test", { tries: 0, authorization: "", baseURL: "http://localhost:6556" }),
  ).resolves.toMatchSnapshot();
});

// Ratelimit is reset to 1 for the previous test, that's why this one acts differently

test("Globally ratelimited and retried", async () => {
  expect(
    createMessage("retry_me", "test", { tries: 1, authorization: "", baseURL: "http://localhost:6556" }),
  ).resolves.toMatchSnapshot();
});
