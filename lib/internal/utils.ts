import { config } from "@dotenvx/dotenvx";
config();
import nacl from "tweetnacl";
import { Buffer } from "node:buffer";
import { env } from "node:process";
import ora from "ora";
import type { Command } from "./types/config.ts";

/**
 * Verifies the signature of the POST request
 */
export async function verifySignature(req: Request): Promise<boolean> {
  const signature = req.headers.get("X-Signature-Ed25519");
  const timestamp = req.headers.get("X-Signature-Timestamp");

  if (!signature || !timestamp) {
    return false;
  }

  const body = await req.text();

  return nacl.sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, "hex"),
    Buffer.from(env.DISCORD_PUBLIC_KEY as string, "hex"),
  );
}

export async function callDiscord(
  endpoint: string,
  options: Record<string, unknown>,
) {
  const url = "https://discord.com/api/v10/" + endpoint;
  if (options.body) options.body = JSON.stringify(options.body);
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${env.DISCORD_TOKEN}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json();
    ora(`Failed to ${options.method} ${endpoint} (${res.status})`).fail();
    console.error(`└ ${data.message}`);
    throw new Error(data.message);
  }
  return res;
}

export async function installGlobalCommands(
  appId: string,
  commands: Omit<Command, "default">[],
) {
  await callDiscord(`applications/${appId}/commands`, {
    method: "PUT",
    body: commands,
  });
}
