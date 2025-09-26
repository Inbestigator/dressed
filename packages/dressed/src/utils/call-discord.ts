import { Buffer } from "node:buffer";
import { type RESTError, type RESTErrorData, type RESTRateLimit, RouteBases } from "discord-api-types/v10";
import ora from "ora";
import type { RawFile } from "../types/file.ts";
import { botEnv } from "./env.ts";
import { checkLimit, headerUpdateLimit, updateLimit } from "./ratelimit.ts";

/** Optional extra config for the layer before fetch */
export interface CallConfig {
  /** The authorization string to use, defaults to `Bot {env.DISCORD_TOKEN}` */
  authorization?: string;
}

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
  { authorization = `Bot ${botEnv.DISCORD_TOKEN}` }: CallConfig = {},
): Promise<Response> {
  const url = new URL(RouteBases.api + endpoint);
  options.method ??= "GET";

  if (typeof options.body === "object" && options.body !== null) {
    if ("files" in options.body) delete options.body.files;
    if ("file" in options.body) delete options.body.file;
  }

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
    headers: { authorization, ...(!files?.length ? { "content-type": "application/json" } : {}) },
    ...(options as RequestInit),
  });

  if (!res.ok) {
    const error = (await res.json()) as RESTError;
    ora(`${error.message} (${error.code})`).fail();

    if (error.errors) {
      logErrorData(error.errors);
    }

    if (res.status === 429) {
      const { global, retry_after } = error as RESTRateLimit;
      updateLimit(global ? "global" : endpoint, 0, Date.now() + retry_after * 1000);
    }

    throw new Error(`Failed to ${options.method} ${endpoint} (${res.status})`, { cause: res });
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
