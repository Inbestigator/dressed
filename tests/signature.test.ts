import nacl from "tweetnacl";
import { verifySignature } from "../lib/internal/utils.ts";
import { Buffer } from "node:buffer";
import { assertEquals } from "@std/assert";

export function generateXSignature(timestamp: string, content: string) {
  const keyPair = nacl.sign.keyPair();
  const message = new TextEncoder().encode(timestamp + content);
  const signature = nacl.sign.detached(message, keyPair.secretKey);

  Deno.env.set(
    "DISCORD_PUBLIC_KEY",
    Buffer.from(keyPair.publicKey).toString("hex"),
  );
  return Buffer.from(signature).toString("hex");
}

Deno.test("Don't verify invalid signature", () => {
  const stamp = Date.now().toString();
  const result = verifySignature(
    "different test",
    generateXSignature(stamp, "test"),
    stamp,
  );

  assertEquals(result, false);
});

Deno.test("Verify valid signature", () => {
  const stamp = Date.now().toString();
  const result = verifySignature(
    "test",
    generateXSignature(stamp, "test"),
    stamp,
  );

  assertEquals(result, true);
});
