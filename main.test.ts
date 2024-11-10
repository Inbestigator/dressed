import nacl from "tweetnacl";
import { verifySignature } from "./lib/core/server.ts";
import { Buffer } from "node:buffer";
import { assertEquals } from "@std/assert";

function generateXSignature(timestamp: string) {
  const keyPair = nacl.sign.keyPair();
  const message = new TextEncoder().encode(timestamp + "content");
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
        "X-Signature-Ed25519": generateXSignature(stamp),
        "X-Signature-Timestamp": stamp,
      },
      body: "different content",
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
        "X-Signature-Ed25519": generateXSignature(stamp),
        "X-Signature-Timestamp": stamp,
      },
      body: "content",
    }),
  );

  assertEquals(result, true);
});
