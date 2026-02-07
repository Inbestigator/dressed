import { expect, test } from "bun:test";
import { env } from "node:process";
import { verifySignature } from "./signature.ts";

const stamp = "0";
const publicKey = "66a27ecb1443a21f793f55fb80b2a9a8335bcd0b8421d1a5fa21491aeb1fe394";
const signature =
  "92b5b884aaf24a4eda897eb3e0dddcadfd94883938edaaef7664933b91cf613668ebd7a7b691778004f1e15259243ce2cc83527f10a71154028f9b407dbca20a";

test("Don't verify invalid signature", () => {
  env.DISCORD_PUBLIC_KEY = publicKey;
  const result = verifySignature("different test", signature, stamp);
  expect(result).resolves.toBeFalse();
});

test("Verify valid signature", () => {
  env.DISCORD_PUBLIC_KEY = publicKey;
  const result = verifySignature("test", signature, stamp);
  expect(result).resolves.toBeTrue();
});
