import ora from "ora";
import type { RawFile } from "../types/file.ts";
import {
  checkLimit,
  headerUpdateLimit,
  updateLimit,
} from "../bot/ratelimit.ts";
import {
  RouteBases,
  type RESTError,
  type RESTRateLimit,
  type RESTErrorData,
} from "discord-api-types/v10";
import { botEnv } from "./env.ts";
import { Buffer } from "node:buffer";

export async function callDiscord(
  endpoint: string,
  options: Omit<RequestInit, "body"> & {
    params?: unknown;
    body?: unknown;
    files?: RawFile[];
    flattenBodyInForm?: boolean;
  },
): Promise<Response> {
  const url = new URL(RouteBases.api + endpoint);
  if (options.params) {
    Object.entries(options.params)
      .filter((p) => p !== undefined)
      .forEach(([key, value]) => {
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
        formData.append(
          fileKey,
          new Blob([Buffer.from(file.data)], { type: file.contentType }),
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
  await checkLimit(endpoint);
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${botEnv.DISCORD_TOKEN}`,
      ...(!options.files?.length ? { "Content-Type": "application/json" } : {}),
    },
    ...(options as unknown as RequestInit),
  });

  if (!res.ok) {
    const error = (await res.json()) as RESTError;
    ora(`${error.message} (${error.code})`).fail();

    if (error.errors) {
      logErrorData(error.errors);
    }

    if (res.status === 429) {
      const ratelimit = error as RESTRateLimit;
      updateLimit(
        ratelimit.global ? "global" : endpoint,
        0,
        Date.now() + ratelimit.retry_after * 1000,
      );
    }

    throw new Error(`Failed to ${options.method} ${endpoint} (${res.status})`);
  }

  headerUpdateLimit(endpoint, res);

  return res;
}

function logErrorData(data: RESTErrorData, path: string[] = []) {
  if (typeof data === "string") {
    console.error(`${path.join(".")}: ${data}`);
  } else if ("_errors" in data && Array.isArray(data._errors)) {
    for (const err of data._errors) {
      logErrorData(err, path);
    }
  } else if (typeof data === "object" && data !== null) {
    for (const [key, value] of Object.entries(data)) {
      logErrorData(value, [...path, key]);
    }
  }
}
