import { writeFileSync } from "node:fs";
import data from "./data.json" with { type: "json" };

// interface Route {
//   key: string;
//   params: `${`url.${string}${`<${string}` | ""}` | "data" | "params"}${"?" | ""}`[];
//   flags?: ("returnVoid" | "deprecated")[];
//   overrides?: {name?:string,apiRoute?:string,};
//   docs: {
//     description: string;
//     infos?: string[];
//     warns?: string[];
//     dangers?: string[];
//     see: string;
//   };
// }

writeFileSync(
  "out.ts",
  `
import {
  Routes,
  ${Array.from(
    new Set(
      data.routes.flatMap(({ key, params, flags }) => [
        params.some((p) => p.startsWith("data")) ? `REST${key}JSONBody` : undefined,
        params.some((p) => p.startsWith("params")) ? `REST${key}Query` : undefined,
        params.some((p) => p.startsWith("url.") && !p.includes("<")) ? "Snowflake" : undefined,
        !flags?.includes("returnVoid") ? `REST${key}Result` : undefined,
      ]),
    ),
  )
    .filter(Boolean)
    .map((i) => `type ${i}`)}
} from "discord-api-types/v10";
import { callDiscord } from "../utils/call-discord.ts";
import { botEnv } from "../utils/env.ts";

${data.routes
  .map(({ docs, key, params, flags, overrides: { name, apiRoute } = {} }) => {
    const method = (key.match(/[A-Z][a-z]+/) ?? [])[0] ?? "";
    const routeKey = key.slice(method.length).replace("API", "");
    apiRoute ??= routeKey;
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
    return `
/**
 * ${docs.description}${docs.infos ? `\n${docs.infos.map((i) => ` * @info ${i}`).join("\n")}` : ""}${docs.warns ? `\n${docs.warns.map((w) => ` * @warn ${w}`).join("\n")}` : ""}${docs.dangers ? `\n${docs.dangers.map((d) => ` * @danger ${d}`).join("\n")}` : ""}
 * @see ${docs.see}${flags?.includes("deprecated") ? "\n * @deprecated" : ""}
 */
export async function ${name}(${params.filter((p) => !p.includes("<")).map((p) => `${p.startsWith("url.") ? p.slice(4) : p}: ${p.startsWith("params") ? `REST${key}Query` : p.startsWith("data") ? `REST${key}JSONBody` : "Snowflake"}`)}): Promise<${flags?.includes("returnVoid") ? "void" : `REST${key}Result`}> {
    const ${!flags?.includes("returnVoid") ? "res" : "_res"} = await callDiscord(Routes.${apiRoute[0].toLowerCase()}${apiRoute.slice(1)}(${params.filter((p) => p.startsWith("url.")).map((p) => (p.includes("<") ? p.split("<")[1] : p.slice(4)))}), {
        ${[`method: "${method.toUpperCase()}"`, params.some((p) => p.startsWith("data")) ? "body: data" : undefined, params.some((p) => p.startsWith("params")) ? "params" : undefined].filter(Boolean)}
    });
    ${!flags?.includes("returnVoid") ? "return res.json()" : ""}
}
`
      .trim()
      .replace(/\/docs/g, "https://discord.com/developers$&");
  })
  .join("\n\n")}
`.trim(),
);
