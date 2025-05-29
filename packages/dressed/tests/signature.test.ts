import nacl from "tweetnacl";
import { verifySignature } from "dressed/server";
import { Buffer } from "node:buffer";
import { test, expect } from "bun:test";
import { env } from "node:process";

export function generateXSignature(timestamp: string, content: string) {
  const keyPair = nacl.sign.keyPair();
  const message = new TextEncoder().encode(timestamp + content);
  const signature = nacl.sign.detached(message, keyPair.secretKey);

  env.DISCORD_PUBLIC_KEY = Buffer.from(keyPair.publicKey).toString("hex");
  return Buffer.from(signature).toString("hex");
}

const stamp = Date.now().toString();

test("Don't verify invalid signature", () => {
  const result = verifySignature(
    "different test",
    generateXSignature(stamp, "test"),
    stamp,
  );

  expect(result).toBeFalse();
});

test("Verify valid signature", () => {
  const result = verifySignature(
    "test",
    generateXSignature(stamp, "test"),
    stamp,
  );

  expect(result).toBeTrue();
});
