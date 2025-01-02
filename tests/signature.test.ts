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

Deno.test("Don't verify invalid signature", async () => {
  const stamp = Date.now().toString();
  const result = await verifySignature(
    new Request("http://localhost:8000", {
      method: "POST",
      headers: {
        "X-Signature-Ed25519": generateXSignature(stamp, "test"),
        "X-Signature-Timestamp": stamp,
      },
      body: "different test",
    }),
  );

  assertEquals(result, false);
});

Deno.test("Verify valid signature", async () => {
  const stamp = Date.now().toString();
  const result = await verifySignature(
    new Request("http://localhost:8000", {
      method: "POST",
      headers: {
        "X-Signature-Ed25519": generateXSignature(stamp, "test"),
        "X-Signature-Timestamp": stamp,
      },
      body: "test",
    }),
  );

  assertEquals(result, true);
});
