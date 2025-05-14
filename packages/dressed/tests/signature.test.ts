import nacl from "tweetnacl";
import { verifySignature } from "../src/server";
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

test("Don't verify invalid signature", () => {
  const stamp = Date.now().toString();
  const result = verifySignature(
    "different test",
    generateXSignature(stamp, "test"),
    stamp,
  );

  expect(result).toBeFalse();
});

test("Verify valid signature", () => {
  const stamp = Date.now().toString();
  const result = verifySignature(
    "test",
    generateXSignature(stamp, "test"),
    stamp,
  );

  expect(result).toBeTrue();
});
