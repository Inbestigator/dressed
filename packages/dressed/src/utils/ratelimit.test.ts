import { beforeEach, describe, expect, test, vi } from "bun:test";
import { bucketIds, buckets, checkLimit, resets } from "./ratelimit.ts";

beforeEach(() => {
  buckets.clear();
  bucketIds.clear();
  resets.global = -1;
  vi.useFakeTimers();
});

type NonCombinedLimit = [Request, (r: Response) => void];

function makeResponse(headers: Record<string, string> = {}) {
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}

async function runCheckLimit(req: Request, bucketTTL = -1) {
  const result = (await checkLimit(req, bucketTTL)) as NonCombinedLimit;
  expect(result[0]).toBe(req);
  return result;
}

async function expectRequestUnblocks(pending: Promise<NonCombinedLimit>, req: Request, advanceMs = 1) {
  await new Promise((r) => setImmediate(r));
  vi.advanceTimersByTime(advanceMs);
  const pended = await pending;
  expect(pended[0]).toEqual(req);
  return pended;
}

function applyBucketLimit(update: (r: Response) => void, bucket: string, limit = 1, remaining = 0, resetAfterMs = 1) {
  update(
    makeResponse({
      "x-ratelimit-bucket": bucket,
      "x-ratelimit-limit": limit.toString(),
      "x-ratelimit-remaining": remaining.toString(),
      "x-ratelimit-reset-after": (resetAfterMs / 1000).toString(),
    }),
  );
}

test("allows a simple GET request", async () => {
  const req = new Request("https://api.test/foo");

  const [, updateLimit] = await runCheckLimit(req, 0.001);

  applyBucketLimit(updateLimit, "foo");

  expect(buckets.size).toBe(1);
  expect(bucketIds.size).toBe(1);

  vi.advanceTimersByTime(1);

  expect(buckets.size).toBe(0);
  expect(bucketIds.size).toBe(0);
});

test("handles global ratelimit", async () => {
  const req = new Request("https://api.test/global");

  const [, updateLimit] = await runCheckLimit(req);

  updateLimit(
    makeResponse({
      "x-ratelimit-scope": "global",
      "retry-after": "0.001",
    }),
  );

  expect(resets.global).toEqual(Date.now() + 1);

  const pending = checkLimit(req, -1) as Promise<NonCombinedLimit>;
  await expectRequestUnblocks(pending, req);

  expect(resets.global).toEqual(Date.now());
});

test("handles bucket ratelimit", async () => {
  const req = new Request("https://api.test/bucket");

  const [, updateLimit] = await runCheckLimit(req);

  applyBucketLimit(updateLimit, "bucket", 1, 0, 1);
  expect(buckets.get("bucket:null")?.refresh).toEqual(Date.now() + 1);

  const pending = checkLimit(req, -1) as Promise<NonCombinedLimit>;
  await expectRequestUnblocks(pending, req);

  expect(buckets.get("bucket:null")?.refresh).toEqual(Date.now());
});

test("batches like GET requests", async () => {
  const req = new Request("https://api.test/batch");

  const pending1 = checkLimit(req, -1) as Promise<NonCombinedLimit>;
  const pending2 = checkLimit(req, -1) as Promise<NonCombinedLimit>;

  const [, updateLimit] = await expectRequestUnblocks(pending2, req);

  applyBucketLimit(updateLimit, "batch", 1, 0, 0);

  expect(pending1).resolves.toBeInstanceOf(Response);
});

describe("combines like PATCH requests", () => {
  test("FormData", async () => {
    const formData = new FormData();
    formData.set("payload_json", JSON.stringify({ b: false }));

    const req1 = new Request("https://api.test/collect", { method: "PATCH", body: JSON.stringify({ a: true }) });
    const req2 = new Request("https://api.test/collect", { method: "PATCH", body: JSON.stringify({ b: true }) });
    const req3 = new Request("https://api.test/collect", { method: "PATCH", body: formData });

    const pending1 = checkLimit(req1, -1) as Promise<NonCombinedLimit>;
    const pending2 = checkLimit(req2, -1) as Promise<NonCombinedLimit>;
    const pending3 = checkLimit(req3, -1) as Promise<NonCombinedLimit>;

    const [req, updateLimit] = await expectRequestUnblocks(pending3, req2);

    expect((await req.clone().formData()).get("payload_json")).toEqual('{"a":true,"b":false}');

    applyBucketLimit(updateLimit, "collect", 1, 0, 0);

    expect(pending1).resolves.toBeInstanceOf(Response);
    expect(pending2).resolves.toBeInstanceOf(Response);
  });
  test("JSON", async () => {
    const req1 = new Request("https://api.test/collect", { method: "PATCH", body: JSON.stringify({ a: true }) });
    const req2 = new Request("https://api.test/collect", { method: "PATCH", body: JSON.stringify({ b: true }) });

    const pending1 = checkLimit(req1, -1) as Promise<NonCombinedLimit>;
    const pending2 = checkLimit(req2, -1) as Promise<NonCombinedLimit>;

    const [req, updateLimit] = await expectRequestUnblocks(pending2, req2);

    expect(await req.clone().json()).toEqual({ a: true, b: true });

    applyBucketLimit(updateLimit, "collect", 1, 0, 0);

    expect(pending1).resolves.toBeInstanceOf(Response);
  });
});
