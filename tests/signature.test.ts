import nacl from "tweetnacl";
import { verifySignature } from "../lib/internal/utils.ts";
import { Buffer } from "node:buffer";
import { assertEquals } from "@std/assert";
import { env } from "node:process";
import type { HonoRequest } from "hono";

function generateXSignature(timestamp: string) {
  const keyPair = nacl.sign.keyPair();
  const message = new TextEncoder().encode(timestamp + "content");
  const signature = nacl.sign.detached(message, keyPair.secretKey);

  env.DISCORD_PUBLIC_KEY = Buffer.from(keyPair.publicKey).toString("hex");
  return Buffer.from(signature).toString("hex");
}

Deno.test("Don't verify invalid signature", async () => {
  const stamp = Date.now().toString();
  const result = await verifySignature({
    text: () => Promise.resolve("different content"),
    header: (name: string) => {
      if (name === "X-Signature-Ed25519") {
        return generateXSignature(stamp);
      } else if (name === "X-Signature-Timestamp") {
        return stamp;
      }
    },
  } as HonoRequest);

  assertEquals(result, false);
});

Deno.test("Verify valid signature", async () => {
  const stamp = Date.now().toString();
  const result = await verifySignature({
    text: () => Promise.resolve("content"),
    header: (name: string) => {
      if (name === "X-Signature-Ed25519") {
        return generateXSignature(stamp);
      } else if (name === "X-Signature-Timestamp") {
        return stamp;
      }
    },
  } as HonoRequest);

  assertEquals(result, true);
});
