import { beforeAll, expect, test } from "bun:test";
import { botEnv } from "../utils/env.ts";
import { verifySignature } from "./signature.ts";

const stamp = "0";
const publicKey = "66a27ecb1443a21f793f55fb80b2a9a8335bcd0b8421d1a5fa21491aeb1fe394";
const signature =
  "92b5b884aaf24a4eda897eb3e0dddcadfd94883938edaaef7664933b91cf613668ebd7a7b691778004f1e15259243ce2cc83527f10a71154028f9b407dbca20a";

beforeAll(() => (botEnv.DISCORD_PUBLIC_KEY = publicKey));

test("returns true for a valid signature", () => {
  expect(verifySignature("test", signature, stamp)).resolves.toBeTrue();
});

test("returns false when the request body is modified", () => {
  expect(verifySignature("different test", signature, stamp)).resolves.toBeFalse();
});

test("returns false when the timestamp is modified", () => {
  expect(verifySignature("test", signature, "1")).resolves.toBeFalse();
});
