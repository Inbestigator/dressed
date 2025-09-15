import { Buffer } from "node:buffer";
import { type RESTError, type RESTErrorData, type RESTRateLimit, RouteBases } from "discord-api-types/v10";
import ora from "ora";
import type { RawFile } from "../types/file.ts";
import { botEnv } from "./env.ts";
import { checkLimit, headerUpdateLimit, updateLimit } from "./ratelimit.ts";

export async function callDiscord(
  endpoint: string,
  {
    params,
    files,
    flattenBodyInForm,
    ...options
  }: Omit<RequestInit, "body"> & {
    params?: unknown;
    body?: unknown;
    files?: RawFile[];
    flattenBodyInForm?: boolean;
  },
): Promise<Response> {
  const token = botEnv.DISCORD_TOKEN;
  const url = new URL(RouteBases.api + endpoint);
  options.method ??= "GET";

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (!value) continue;
      url.searchParams.append(key, typeof value === "string" ? value : JSON.stringify(value));
    }
  }
  if (files?.length) {
    const formData = new FormData();

    for (const [index, file] of files.entries()) {
      const fileKey = file.key ?? `files[${index}]`;
      formData.append(
        fileKey,
        new Blob([Buffer.isBuffer(file.data) ? Buffer.from(file.data) : file.data.toString()], {
          type: file.contentType,
        }),
        file.name,
      );
    }

    if (options.body && flattenBodyInForm) {
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

  await checkLimit(endpoint, options.method);

  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${token}`,
      ...(!files?.length ? { "Content-Type": "application/json" } : {}),
    },
    ...(options as RequestInit),
  });

  if (!res.ok) {
    const error = (await res.json()) as RESTError;
    ora(`${error.message} (${error.code})`).fail();

    if (error.errors) {
      logErrorData(error.errors);
    }

    if (res.status === 429) {
      const ratelimit = error as RESTRateLimit;
      updateLimit(ratelimit.global ? "global" : endpoint, 0, Date.now() + ratelimit.retry_after * 1000);
    }

    throw new Error(`Failed to ${options.method} ${endpoint} (${res.status})`);
  }

  headerUpdateLimit(endpoint, res, options.method);

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
