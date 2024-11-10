import nacl from "tweetnacl";
import { verifySignature } from "./lib/core/server.ts";

function generateXSignature(timestamp: string) {
  const keyPair = nacl.sign.keyPair();
  const message = new TextEncoder().encode("asdasd" + timestamp);
  const signature = nacl.sign.detached(message, keyPair.secretKey).toString();
  return signature.slice(0, 128);
}

Deno.test("Invalid signature", async () => {
  const stamp = Date.now().toString();
  const result = await verifySignature(
    new Request("http://localhost:8000", {
      method: "POST",
      headers: {
        "X-Signature-Ed25519": generateXSignature(stamp),
        "X-Signature-Timestamp": stamp,
      },
      body: "asdasd",
    }),
  );
  if (result) {
    throw new Error("Should not verify signature");
  }
});
