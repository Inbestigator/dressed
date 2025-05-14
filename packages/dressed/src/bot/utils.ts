import { stdout } from "node:process";
import ora from "ora";
import { filetypeinfo } from "magic-bytes.js";
import type { RawFile } from "../types/file.ts";
import { checkLimit, headerUpdateLimit, updateLimit } from "./ratelimit.ts";
import {
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  RouteBases,
  Routes,
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
    const data = await res.json();
    ora({
      stream: stdout,
      text: `Failed to ${options.method} ${endpoint} (${res.status} })`,
    }).fail();
    console.error(`└ ${data.message}`);
    if (res.status === 429) {
      updateLimit(
        data.global ? "global" : endpoint,
        0,
        Date.now() + data.retry_after * 1000,
      );
    }
    throw new Error(data.message);
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
