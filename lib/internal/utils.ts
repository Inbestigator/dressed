import { config } from "dotenv";
config();
import nacl from "tweetnacl";
import { Buffer } from "node:buffer";
import { env } from "node:process";
import ora from "ora";
import {
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  RouteBases,
  Routes,
} from "discord-api-types/v10";
import { filetypeinfo } from "magic-bytes.js";
import type { RawFile } from "./types/file.ts";

/**
 * Verifies the signature of the POST request
 */
export function verifySignature(
  body: string,
  signature?: string | string[] | null,
  timestamp?: string | string[] | null,
): boolean {
  if (
    !signature || !timestamp || typeof signature !== "string" ||
    typeof timestamp !== "string"
  ) {
    return false;
  }

  return nacl.sign.detached.verify(
    new Uint8Array(Buffer.from(timestamp + body)),
    new Uint8Array(Buffer.from(signature, "hex")),
    new Uint8Array(Buffer.from(env.DISCORD_PUBLIC_KEY as string, "hex")),
  );
}

const limits: Record<string, {
  remaining: number;
  resetAt: number;
}> = {};

export async function callDiscord(
  endpoint: string,
  options: Omit<RequestInit, "body"> & {
    params?: Record<string, unknown>;
    body?: unknown;
    files?: RawFile[];
    flattenBodyInForm?: boolean;
  },
) {
  async function delayUntil(time: number) {
    const delayDuration = Math.max(0, time - Date.now());
    await new Promise((resolve) => setTimeout(resolve, delayDuration));
  }

  if (limits.global) {
    if (limits.global.remaining === 0) {
      ora(
        `You have hit the global rate limit!\nWaiting to send again...`,
      ).warn();
      await delayUntil(limits.global.resetAt);
      delete limits.global;
    } else if (limits.global.remaining < 2) {
      ora("You are about to hit the global rate limit!").warn();
    }
  } else if (
    limits[endpoint]
  ) {
    if (limits[endpoint].remaining === 0) {
      ora(
        `You have hit the rate limit for ${endpoint}!\nWaiting to send again...`,
      ).warn();
      await delayUntil(limits[endpoint].resetAt);
      delete limits[endpoint];
    } else if (limits[endpoint].remaining < 3) {
      ora(`You are about to hit the rate limit for ${endpoint}!`).warn();
    }
  }

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
          const [parsedType] = filetypeinfo(new Uint8Array(file.data));
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
    if (res.status === 429) {
      if (data.global) {
        limits.global = {
          remaining: 0,
          resetAt: Date.now() + data.retry_after * 1000,
        };
      } else {
        limits[endpoint] = {
          remaining: 0,
          resetAt: Date.now() + data.retry_after * 1000,
        };
      }
    }
    throw new Error(data.message);
  }

  const remaining = res.headers.get("x-ratelimit-remaining");
  const resetAt = res.headers.get("x-ratelimit-reset");
  if (remaining) {
    limits[endpoint] = {
      remaining: Number(remaining),
      resetAt: Number(resetAt) * 1000,
    };
  }

  return res;
}

export async function installGlobalCommands(
  appId: string,
  commands: RESTPostAPIChatInputApplicationCommandsJSONBody[],
) {
  await callDiscord(Routes.applicationCommands(appId), {
    method: "PUT",
    body: commands,
  });
}
