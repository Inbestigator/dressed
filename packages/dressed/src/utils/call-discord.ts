import { Buffer } from "node:buffer";
import { type RESTError, type RESTErrorData, RouteBases } from "discord-api-types/v10";
import type { RawFile } from "../types/file.ts";
import { botEnv } from "./env.ts";
import { logError } from "./log.ts";
import { checkLimit, updateLimit } from "./ratelimit.ts";

/** Optional extra config for the layer before fetch */
export interface CallConfig {
  /** The authorization string to use, defaults to `Bot {env.DISCORD_TOKEN}` */
  authorization?: string;
  /** Number of retries when rate limited before the caller gives up, defaults to 3 */
  tries?: number;
  /**
   * The location which endpoints branch off from
   * @default "https://discord.com/api/v10"
   */
  routeBase?: string;
}

export async function callDiscord(
  endpoint: string,
  init: Omit<RequestInit, "body"> & {
    method: string;
    params?: unknown;
    body?: unknown;
    files?: RawFile[];
    flattenBodyInForm?: boolean;
  },
  $req: CallConfig = {},
): Promise<Response> {
  const { params, files, flattenBodyInForm, ...options } = { ...init };
  const global$Req = globalThis.DRESSED_CONFIG.requests;
  const {
    authorization = global$Req?.authorization ?? `Bot ${botEnv.DISCORD_TOKEN}`,
    tries = global$Req?.tries ?? 3,
    routeBase = global$Req?.routeBase ?? RouteBases.api,
  } = $req;
  const url = new URL(routeBase + endpoint);

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

  const req = new Request(url, {
    headers: { authorization, ...(!files?.length ? { "content-type": "application/json" } : {}) },
    ...(options as RequestInit),
  });

  await checkLimit(req);

  const res = await fetch(req);

  updateLimit(req, res);

  if (!res.ok) {
    if (res.status === 429 && tries > 0) {
      $req.tries = tries - 1;
      return callDiscord(endpoint, init, $req);
    }

    const error = (await res.json()) as RESTError;
    logError(`${error.message} (${error.code ?? res.status})`);

    if (error.errors) logErrorData(error.errors);

    throw new Error(`Failed to ${options.method} ${endpoint} (${res.status})`, { cause: res });
  }

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
