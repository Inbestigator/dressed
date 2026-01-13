import { writeFileSync } from "node:fs";
import { $ } from "bun";
import routeData from "./data.json";

function routeKeyToMethodName(method: string, key: string) {
  const routeKey = key.slice(method.length).replace("API", "");
  const prefix = {
    Get: routeKey.endsWith("s") ? "list" : "get",
    Post: "create",
    Put: "add",
    Patch: "modify",
    Delete: "delete",
  }[method];

  const splitRoutes = routeKey.match(/[A-Z][a-z]+/g) ?? [];
  return (
    prefix +
    (splitRoutes.length > 1 ? splitRoutes.slice(1) : splitRoutes)
      .join("")
      .slice(0, routeKey.endsWith("s") && method !== "Get" ? -1 : undefined)
  );
}

writeFileSync(
  "./src/resources/generated.resources.ts",
  `
import {
  Routes,
  ${Array.from(
    new Set(
      routeData.routes
        .flatMap(({ key, params, flags, overrides }) => {
          const defaultDataType = `REST${key}JSONBody`;
          const defaultReturnType = `REST${key}Result`;
          const defaultParamsType = `REST${key}Query`;
          return [
            params.some((p) => p.startsWith("data")) &&
            (!overrides?.dataType || overrides.dataType.includes(defaultDataType))
              ? `type ${defaultDataType}`
              : undefined,
            params.some((p) => p.startsWith("params")) &&
            (!overrides?.paramsType || overrides.paramsType.includes(defaultParamsType))
              ? `type ${defaultParamsType}`
              : undefined,
            params.some((p) => p.startsWith("url.") && !p.includes("<")) ? "type Snowflake" : undefined,
            !flags?.includes("returnVoid") &&
            (!overrides?.returnType || overrides.returnType.includes(defaultReturnType))
              ? `type ${defaultReturnType}`
              : undefined,
            overrides?.imports,
          ];
        })
        .filter(Boolean),
    ),
  )}
} from "discord-api-types/v10";
import type { RawFile } from "../types/file.ts";
import { callDiscord, type CallConfig } from "../utils/call-discord.ts";
import { botEnv } from "../utils/env.ts";

${routeData.routes
  .map(
    ({
      docs,
      key,
      params,
      flags,
      overrides: {
        apiRoute,
        dataType,
        dangerousExtraLogic,
        name,
        returnType,
        messageKey,
        fetchOptions,
        generic,
        paramsType,
      } = {},
    }) => {
      const method = (key.match(/[A-Z][a-z]+/) ?? [])[0] ?? "";
      const routeKey = key.slice(method.length).replace("API", "");

      apiRoute ??= routeKey;
      dangerousExtraLogic ??= "";
      const fileTypeLine = ` & { file${flags?.includes("singlefile") ? "" : "s"}?: RawFile${flags?.includes("singlefile") ? "" : "[]"} }`;
      dataType ??= `${flags?.includes("hasStringableContent") ? "string | " : ""}REST${key}JSONBody${flags?.includes("hasFiles") ? fileTypeLine : ""}`;
      paramsType ??= `REST${key}Query`;
      messageKey ??= "";
      name ??= routeKeyToMethodName(method, key);
      returnType ??= flags?.includes("returnVoid") ? "void" : `REST${key}Result`;
      const jsdocs = [
        ` * ${docs.description}`,
        docs.infos?.map((i) => ` * @info ${i}`),
        docs.warns?.map((w) => ` * @warn ${w}`),
        docs.dangers?.map((d) => ` * @danger ${d}`),
        `* @see ${docs.see}`,
        flags?.includes("deprecated") && " * @deprecated",
      ].filter(Boolean);
      const fileValue = flags?.includes("singlefile")
        ? `[{ ...data${messageKey}.file, key: "file" }]`
        : `data${messageKey}.files`;
      return (() =>
        `
/**
${jsdocs.flat().join("\n")}
 */
export async function ${name}${generic ? `<${generic}>` : ""}(${params
          .concat("var.$req?: CallConfig")
          .filter((p) => !p.includes("<"))
          .map((p) => {
            let paramType = "";
            if (p.startsWith("params")) paramType = `: ${paramsType}`;
            else if (p.startsWith("data")) paramType = `: ${dataType}`;
            else if (!p.includes(":")) paramType = ": Snowflake";
            return `${/^(url|var)\./.test(p) ? p.slice(4) : p}${paramType}`;
          })}): Promise<${returnType}> {
  ${dangerousExtraLogic}
  ${flags?.includes("hasStringableContent") ? `if (typeof data${messageKey} === "string") data${messageKey} = { content: data${messageKey} };` : ""}
  const ${flags?.includes("returnVoid") ? "_res" : "res"} = await callDiscord(Routes${apiRoute.startsWith("[") ? apiRoute : `.${apiRoute[0].toLowerCase()}${apiRoute.slice(1)}`}(${params
    .filter((p) => p.startsWith("url."))
    .map((p) => (p.endsWith("?") ? p.slice(0, -1) : p))
    .map((p) => (p.includes("<") ? p.split("<")[1] : p.slice(4)))
    .map((p) => (p.includes(":") ? p.split(/[?:]/)[0] : p).replace(/botEnv\.([A-Z_]+)/, "$req?.env?.$1??$&"))}), {
      ${[`method: "${method.toUpperCase()}"`, params.some((p) => p.startsWith("data")) ? "body: data" : undefined, params.some((p) => p.startsWith("params")) ? "params" : undefined, flags?.includes("hasFiles") ? `files: ${fileValue}` : undefined].filter(Boolean)}
      ${Object.entries(fetchOptions ?? [])
        .map(([k, v]) => `,${k}: ${JSON.stringify(v)}`)
        .join("")}
  }, $req);
  ${flags?.includes("returnVoid") ? "" : "return res.json()"}
}
`
          .trim()
          .replace(/\/docs/g, "https://discord.com/developers$&"))();
    },
  )
  .join("\n\n")}
`.trim(),
);

await $`bun --bun biome check ./src/resources/generated.resources.ts --write --vcs-enabled=false`;
