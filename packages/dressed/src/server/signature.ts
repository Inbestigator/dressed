import { botEnv } from "../utils/env.ts";

function hex2bin(hex: string) {
  const buf = new Uint8Array(Math.ceil(hex.length / 2));
  for (let i = 0; i < buf.length; ++i) {
    buf[i] = Number.parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return buf;
}

/**
 * Verifies the signature of the POST request
 */
export async function verifySignature(body: string, signature: string, timestamp: string): Promise<boolean> {
  return crypto.subtle.verify(
    { name: "Ed25519" },
    await crypto.subtle.importKey("raw", hex2bin(botEnv.DISCORD_PUBLIC_KEY), "Ed25519", false, ["verify"]),
    hex2bin(signature),
    new TextEncoder().encode(timestamp + body),
  );
}
