import { Buffer } from "node:buffer";
import { type RESTError, type RESTErrorData, RouteBases } from "discord-api-types/v10";
import type { RawFile } from "../types/file.ts";
import { botEnv, serverConfig } from "./env.ts";
import { logError } from "./log.ts";
import { checkLimit } from "./ratelimit.ts";

/** Optional extra config for the layer before fetch */
export interface CallConfig {
  /**
   * The authorization string to use
   * @default `Bot {env.DISCORD_TOKEN}`
   */
  authorization?: string;
  /**
   * Number of retries when rate limited before the caller gives up
   * @default 3
   */
  tries?: number;
  /**
   * The location which endpoints branch off from
   * @default "https://discord.com/api/v10"
   */
  routeBase?: string;
  /**
   * Environment variables to use
   * @default {botEnv}
   */
  env?: Partial<typeof botEnv>;
  /**
   * Delay in seconds before old ratelimit buckets are purged from the cache, set to -1 to disable
   * @default 1,800 // 30 minutes
   */
  bucketTTL?: number;
}

function processFiles(files: RawFile[], body: BodyInit, flattenBodyInForm?: boolean) {
  if (typeof body === "object" && body !== null) {
    if ("files" in body) delete body.files;
    if ("file" in body) delete body.file;
  }

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

  if (body && flattenBodyInForm) {
    for (const [key, value] of Object.entries(body)) {
      formData.append(key, value);
    }
  } else if (body) {
    formData.append("payload_json", JSON.stringify(body));
  }

  return formData;
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
  const reqsConfig = serverConfig.requests;
  const {
    authorization = reqsConfig?.authorization ?? `Bot ${$req.env?.DISCORD_TOKEN ?? botEnv.DISCORD_TOKEN}`,
    tries = reqsConfig?.tries ?? 3,
    routeBase = reqsConfig?.routeBase ?? RouteBases.api,
    bucketTTL = reqsConfig?.bucketTTL ?? 30 * 60,
  } = $req;
  const url = new URL(routeBase + endpoint);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (!value) continue;
      url.searchParams.append(key, typeof value === "string" ? value : JSON.stringify(value));
    }
  }
  if (files?.length) options.body = processFiles(files, options.body as BodyInit, flattenBodyInForm);
  else if (options.body) options.body = JSON.stringify(options.body);

  const req = new Request(url, {
    headers: { authorization, "content-type": files?.length ? "multipart/form-data" : "application/json" },
    ...(options as RequestInit),
  });

  const updateLimit = await checkLimit(req, bucketTTL);

  const res = await fetch(req);

  updateLimit(res);

  async function handleResErr() {
    if (res.status === 429 && tries > 0) {
      $req.tries = tries - 1;
      return callDiscord(endpoint, init, $req);
    }

    const error = (await res.json()) as RESTError;
    logError(`${error.message} (${error.code ?? res.status})`);

    if (error.errors) logErrorData(error.errors);

    throw new Error(`Failed to ${options.method} ${endpoint} (${res.status})`, { cause: res });
  }

  if (!res.ok) return handleResErr();

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
