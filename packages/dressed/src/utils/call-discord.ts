import { type RESTError, type RESTErrorData, RouteBases } from "discord-api-types/v10";
import type { CallConfig } from "../types/config.ts";
import type { RawFile } from "../types/file.ts";
import { botEnv, config } from "./env.ts";
import { checkLimit } from "./ratelimit.ts";

function isBufferLike(value: unknown): value is ArrayBuffer | Uint8Array | Uint8ClampedArray {
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
    if (typeof Blob !== "undefined" && file.data instanceof Blob) {

      formData.append(key, file.data, file.name);

    } else if (isBufferLike(file.data)) {

      // Safely convert ArrayBuffer or other typed array buffers to a standard Uint8Array view

      const bufferData = file.data instanceof Uint8Array

        ? file.data

        : file.data instanceof ArrayBuffer

          ? new Uint8Array(file.data)

          : new Uint8Array(file.data.buffer, file.data.byteOffset, file.data.byteLength);



      // Detect common MIME types from file signatures safely

      const mime = file.contentType ?? guessMimeType(bufferData) ?? "application/octet-stream";

      formData.append(

        key,

        new Blob([file.data], {

          type: { "image/apng": "image/png" }[mime] ?? mime,

        }),

        file.name,

      );

    } else {

      formData.append(key, new Blob([file.data.toString()], { type: file.contentType }), file.name);

    }

  }
  return formData;
}

/** Simple signature-based MIME type detection without external dependencies */
function guessMimeType(data: Uint8Array): string | undefined {

  let offset = 0;

  // Skip UTF-8 BOM if present

  if (data.length >= 3 && data[0] === 0xEF && data[1] === 0xBB && data[2] === 0xBF) {

    offset = 3;

  }

  // Skip leading whitespace

  while (offset < data.length && (data[offset] === 0x20 || data[offset] === 0x09 || data[offset] === 0x0a || data[offset] === 0x0d)) {

    offset++;

  }

  if (data.length - offset < 4) return undefined;

  const header = data.subarray(offset, offset + 16);


  // PNG
  if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47) return "image/png";
  
  // JPEG
  if (header[0] === 0xff && header[1] === 0xd8) return "image/jpeg";
  
  // GIF
  if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46) return "image/gif";
  
  // WebP
  if (
    header.length >= 12 && 
    header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46 && // RIFF
    header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50    // WEBP
  ) {
    return "image/webp";
  }
  
  // SVG (Catches raw <svg or <?xml preambles)
  if (
    (header[0] === 0x3c && header[1] === 0x73 && header[2] === 0x76 && header[3] === 0x67) || // <svg
    (header[0] === 0x3c && header[1] === 0x3f && header[2] === 0x78 && header[3] === 0x6d)    // <?xm
  ) return "image/svg+xml";

  // MP4 (Specific check for MP4 containers)
  if (header.length >= 12 && header[4] === 0x66 && header[5] === 0x74 && header[6] === 0x79 && header[7] === 0x70) {
    const brand = String.fromCharCode(header[8], header[9], header[10], header[11]);
    if (brand === "mp42" || brand === "isom" || brand === "iso2") return "video/mp4";
  }
  
  // PDF
  if (header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46) return "application/pdf";

  return undefined;
}

export async function callDiscord(
  endpoint: string,
  init: Omit<RequestInit, "body"> & { method: string; params?: unknown; body?: unknown; files?: RawFile[] },
  $req: CallConfig = {},
): Promise<Response> {
  const { params, files, ...options } = { ...init };
  const {
    authorization = `Bot ${$req.env?.DISCORD_TOKEN ?? botEnv.DISCORD_TOKEN}`,
    bucketTTL = 30 * 60,
    routeBase = RouteBases.api,
    skipQueue,
    tries = 3,
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

  let req = new Request(url, {
    headers: { authorization, ...(files?.length ? {} : { "content-type": "application/json" }) },
    ...(options as RequestInit),
  });
  let observeRes: ((r: Response) => void) | undefined;

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

  req = (await hooks.onBeforeFetch?.(req.clone())) ?? req;

  const limiter = skipQueue ? ([req, () => {}] as [Request, (v: Response) => void]) : await checkLimit(req, bucketTTL);

  if (limiter instanceof Response) return handleRes(limiter);

  const [batchedReq, updateLimit] = limiter;

  hooks.onFetch?.(batchedReq.clone(), new Promise<Response>((r) => (observeRes = r)));

  const res = await fetch(batchedReq);

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
