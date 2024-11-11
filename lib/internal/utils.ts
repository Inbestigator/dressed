import "@std/dotenv/load";
import nacl from "tweetnacl";
import { Buffer } from "node:buffer";

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
    Buffer.from(Deno.env.get("DISCORD_PUBLIC_KEY") as string, "hex"),
  );
}

export async function DiscordRequest(
  endpoint: string,
  options: Record<string, unknown>,
) {
  const url = "https://discord.com/api/v10/" + endpoint;
  if (options.body) options.body = JSON.stringify(options.body);
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${Deno.env.get("DISCORD_TOKEN")}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  return res;
}

export async function InstallGlobalCommands(
  appId: string,
  commands: {
    name: string;
    description: string;
    type: number;
    integration_types: number[];
    contexts: number[];
    options?: { name: string; description: string; type: number }[];
  }[],
) {
  const endpoint = `applications/${appId}/commands`;

  try {
    await DiscordRequest(endpoint, { method: "PUT", body: commands });
  } catch (err) {
    console.error(err);
  }
}
