import { config } from "@dotenvx/dotenvx";
config();
import nacl from "tweetnacl";
import { Buffer } from "node:buffer";
import { env } from "node:process";
import ora from "ora";
import type { CommandConfig } from "./types/config.ts";
import { RouteBases, Routes } from "discord-api-types/v10";
import { filetypeinfo } from "magic-bytes.js";
import type { RawFile } from "./types/file.ts";

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
  options: Omit<RequestInit, "body"> & {
    params?: Record<string, unknown>;
    body?: unknown;
    files?: RawFile[];
    flattenBodyInForm?: boolean;
  },
) {
  const url = new URL(RouteBases.api + endpoint);
  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.append(
        key,
        typeof value === "string" ? value : JSON.stringify(value),
      );
    });
  }
  if (options.files?.length) {
    const files = options.files;
    const formData = new FormData();

    for (const [index, file] of files.entries()) {
      const fileKey = file.key ?? `files[${index}]`;
      if (Buffer.isBuffer(file.data)) {
        let contentType = file.contentType;
        if (!contentType) {
          const [parsedType] = filetypeinfo(file.data);
          if (parsedType) {
            contentType = parsedType.mime === "image/apng"
              ? "image/png"
              : parsedType.mime ??
                "application/octet-stream";
          }
        }
        formData.append(
          fileKey,
          new Blob([file.data], { type: contentType }),
          file.name,
        );
      } else {
        formData.append(
          fileKey,
          new Blob([`${file.data}`], { type: file.contentType }),
          file.name,
        );
      }
    }

    if (options.body && options.flattenBodyInForm) {
      for (const [key, value] of Object.entries(options.body)) {
        formData.append(key, value);
      }
    } else if (options.body) {
      formData.append("payload_json", JSON.stringify(options.body));
    }

    options.body = formData;
  } else if (options.body) {
    options.body = JSON.stringify(options.body);
  }
  const res = await fetch(url, {
    headers: options.files?.length
      ? {
        Authorization: `Bot ${env.DISCORD_TOKEN}`,
      }
      : {
        Authorization: `Bot ${env.DISCORD_TOKEN}`,
        "Content-Type": "application/json",
      },
    ...options as unknown as RequestInit,
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
  commands: (CommandConfig & {
    name: string;
  })[],
) {
  await callDiscord(Routes.applicationCommands(appId), {
    method: "PUT",
    body: commands,
  });
}
