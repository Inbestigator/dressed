import { botEnv } from "../utils/env.ts";

/**
 * Verifies the signature of the POST request
 */
export async function verifySignature(body: string, signature: string, timestamp: string): Promise<boolean> {
  return crypto.subtle.verify(
    { name: "Ed25519" },
    await crypto.subtle.importKey("raw", Buffer.from(botEnv.DISCORD_PUBLIC_KEY, "hex"), "Ed25519", false, ["verify"]),
    Buffer.from(signature, "hex"),
    new TextEncoder().encode(timestamp + body),
  );
}
