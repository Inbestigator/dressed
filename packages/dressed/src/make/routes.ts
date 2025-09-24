import { writeFileSync } from "node:fs";
import { $ } from "bun";
import data from "./data.json" with { type: "json" };

writeFileSync(
  "out.ts",
  `
import {
  Routes,
  ${Array.from(
    new Set(
      data.routes.flatMap(({ key, params, flags, overrides }) => {
        const defaultDataType = `type REST${key}JSONBody`;
        const defaultReturnType = `type REST${key}Result`;
        return [
          params.some((p) => p.startsWith("data")) ? defaultDataType : undefined,
          params.some((p) => p.startsWith("params")) ? `type REST${key}Query` : undefined,
          params.some((p) => p.startsWith("url.") && !p.includes("<")) ? "type Snowflake" : undefined,
          !flags?.includes("returnVoid") && (!overrides?.returnType || overrides.returnType.includes(defaultReturnType))
            ? defaultReturnType
            : undefined,
          overrides?.imports,
        ];
      }),
    ),
  ).filter(Boolean)}
} from "discord-api-types/v10";
import type { RawFile } from "../types/file.ts";
import { callDiscord } from "../utils/call-discord.ts";
import { botEnv } from "../utils/env.ts";

${data.routes
  .map(
    ({
      docs,
      key,
      params,
      flags,
      overrides: { apiRoute, dataType, dangerousExtraLogic, name, returnType, messageKey } = {},
    }) => {
      const method = (key.match(/[A-Z][a-z]+/) ?? [])[0] ?? "";
      const routeKey = key.slice(method.length).replace("API", "");
      apiRoute ??= routeKey;
      dangerousExtraLogic ??= "";
      dataType ??= `REST${key}JSONBody${flags?.includes("hasFiles") ? ` & { file${flags.includes("singlefile") ? "" : "s"}?: RawFile${flags.includes("singlefile") ? "" : "[]"} }` : ""}`;
      messageKey ??= "";
      name ??=
        (method === "Get" && routeKey.endsWith("s")
          ? "list"
          : method === "Get"
            ? "get"
            : method === "Post"
              ? "create"
              : method === "Put"
                ? "add"
                : method === "Patch"
                  ? "modify"
                  : method === "Delete"
                    ? "delete"
                    : "") +
        routeKey.replace("Application", "").slice(0, routeKey.endsWith("s") && method !== "Get" ? -1 : undefined);
      returnType ??= flags?.includes("returnVoid") ? "void" : `REST${key}Result`;
      return `
/**
 * ${docs.description}${docs.infos ? `\n${docs.infos.map((i) => ` * @info ${i}`).join("\n")}` : ""}${docs.warns ? `\n${docs.warns.map((w) => ` * @warn ${w}`).join("\n")}` : ""}${docs.dangers ? `\n${docs.dangers.map((d) => ` * @danger ${d}`).join("\n")}` : ""}
 * @see ${docs.see}${flags?.includes("deprecated") ? "\n * @deprecated" : ""}
 */
export async function ${name}(${params.filter((p) => !p.includes("<")).map((p) => `${/^(url|var)\./.test(p) ? p.slice(4) : p}${p.startsWith("params") ? `: REST${key}Query` : p.startsWith("data") ? `: ${dataType}` : !p.includes(":") ? ": Snowflake" : ""}`)}): Promise<${returnType}> {
  ${dangerousExtraLogic}
  ${flags?.includes("hasStringableContent") ? `if (typeof data${messageKey} === "string") data${messageKey} = { content: data${messageKey} };` : ""}
  const ${!flags?.includes("returnVoid") ? "res" : "_res"} = await callDiscord(Routes${apiRoute.startsWith("[") ? apiRoute : `.${apiRoute[0].toLowerCase()}${apiRoute.slice(1)}`}(${params
    .filter((p) => p.startsWith("url."))
    .map((p) => (p.endsWith("?") ? p.slice(0, -1) : p))
    .map((p) => (p.includes("<") ? p.split("<")[1] : p.slice(4)))
    .map((p) => (p.includes(":") ? p.split(":")[0] : p))}), {
      ${[`method: "${method.toUpperCase()}"`, params.some((p) => p.startsWith("data")) ? "body: data" : undefined, params.some((p) => p.startsWith("params")) ? "params" : undefined, flags?.includes("hasFiles") ? `files: ${flags.includes("singlefile") ? `[{ ...data${messageKey}.file, key: "file" }]` : `data${messageKey}.files`}` : undefined].filter(Boolean)}
  });
  ${!flags?.includes("returnVoid") ? "return res.json()" : ""}
}
`
        .trim()
        .replace(/\/docs/g, "https://discord.com/developers$&");
    },
  )
  .join("\n\n")}
`.trim(),
);

await $`bun --bun biome check --write`;
