import ora, { type Ora } from "ora";
import { filetypeinfo } from "magic-bytes.js";
import type { RawFile } from "../types/file.ts";
import { checkLimit, headerUpdateLimit, updateLimit } from "./ratelimit.ts";
import {
  RouteBases,
  Routes,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  type RESTError,
  type RESTRateLimit,
  type RESTErrorData,
} from "discord-api-types/v10";
import { botEnv } from "../env.ts";
import { Buffer } from "node:buffer";

export async function callDiscord(
  endpoint: string,
  options: Omit<RequestInit, "body"> & {
    params?: Record<string, unknown>;
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
        let contentType = file.contentType;
        if (!contentType) {
          const [parsedType] = filetypeinfo(new Uint8Array(file.data));
          if (parsedType) {
            contentType =
              parsedType.mime === "image/apng"
                ? "image/png"
                : (parsedType.mime ?? "application/octet-stream");
          }
        }
        formData.append(
          fileKey,
          new Blob([Buffer.from(file.data)], { type: contentType }),
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

export async function installGlobalCommands(
  appId: string,
  commands: RESTPostAPIChatInputApplicationCommandsJSONBody[],
) {
  await callDiscord(Routes.applicationCommands(appId), {
    method: "PUT",
    body: commands,
  });
}

export function logRunnerError(error: unknown, loader: Ora) {
  const text = loader.text.replace("Running", "Failed to run");
  if (error instanceof Error) {
    loader.fail(`${text} - ${error.message}`);
  } else {
    loader.fail(text);
    console.error(error);
  }
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
