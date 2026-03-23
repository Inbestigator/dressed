import { Buffer } from "node:buffer";
import { type RESTError, type RESTErrorData, RouteBases } from "discord-api-types/v10";
import { filetypeinfo } from "magic-bytes.js";
import type { CallConfig } from "../types/config.ts";
import type { RawFile } from "../types/file.ts";
import { botEnv, config } from "./env.ts";
import logger from "./log.ts";
import { checkLimit } from "./ratelimit.ts";

function isBufferLike(value: unknown): value is Buffer | Uint8Array {
  return value instanceof ArrayBuffer || value instanceof Uint8Array || value instanceof Uint8ClampedArray;
}

function processFiles(files: RawFile[], body: BodyInit) {
  if (typeof body === "object" && body !== null) {
    if ("files" in body) delete body.files;
    if ("file" in body) delete body.file;
  }

  const formData = new FormData();

  if (body) {
    formData.append("payload_json", JSON.stringify(body));
  }

  for (const [index, file] of files.entries()) {
    const key = file.key ?? `files[${index}]`;
    if (isBufferLike(file.data)) {
      const type = filetypeinfo(file.data)[0]?.mime ?? "application/octet-stream";
      formData.append(
        key,
        new Blob([Buffer.from(file.data)], {
          type: file.contentType ?? { "image/apng": "image/png" }[type] ?? type,
        }),
        file.name,
      );
    } else {
      formData.append(key, new Blob([file.data.toString()], { type: file.contentType }), file.name);
    }
  }
  return formData;
}

export async function callDiscord(
  endpoint: string,
  init: Omit<RequestInit, "body"> & { method: string; params?: unknown; body?: unknown; files?: RawFile[] },
  $req: CallConfig = {},
): Promise<Response> {
  const { params, files, ...options } = { ...init };
  const {
    authorization = `Bot ${$req.env?.DISCORD_TOKEN ?? botEnv.DISCORD_TOKEN}`,
    tries = 3,
    routeBase = RouteBases.api,
    bucketTTL = 30 * 60,
  } = { ...config.requests, ...$req };
  const hooks = { ...config.hooks, ...$req.hooks };
  const url = new URL(routeBase + endpoint);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (!value) continue;
      url.searchParams.append(key, typeof value === "string" ? value : JSON.stringify(value));
    }
  }
  if (files?.length) options.body = processFiles(files, options.body as BodyInit);
  else if (options.body) options.body = JSON.stringify(options.body);

  const req = new Request(url, {
    headers: { authorization, ...(files?.length ? {} : { "content-type": "application/json" }) },
    ...(options as RequestInit),
  });
  let observeRes: ((r: Response) => void) | undefined;
  hooks.onFetch?.(req.clone(), new Promise<Response>((r) => (observeRes = r)));

  async function handleRes(res: Response) {
    observeRes?.(res.clone());
    if (res.ok) return res;
    if (res.status === 429 && tries > 0) {
      $req.tries = tries - 1;
      return callDiscord(endpoint, init, $req);
    }

    const error: RESTError = await res.json();
    logger.error(new Error(`${error.message} (${error.code ?? res.status})`, { cause: { req, res } }));

    if (error.errors) logErrorData(error.errors);

    throw new Error(`Failed to ${options.method} ${endpoint} (${res.status})`, { cause: res });
  }

  const limiter = await checkLimit((await hooks.onBeforeFetch?.(req.clone())) ?? req, bucketTTL);

  if (limiter instanceof Response) return handleRes(limiter);

  const [limitedReq, updateLimit] = limiter;
  const res = await fetch(limitedReq);

  updateLimit(res);

  return handleRes(res);
}

function logErrorData(data: RESTErrorData, path: string[] = []) {
  if (typeof data === "string") {
    logger.raw.error(`${path.join(".")}: ${data}`);
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
