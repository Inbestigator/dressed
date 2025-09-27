import { mkdirSync, writeFileSync } from "node:fs";
import { routes } from "../packages/dressed/src/resources/make/data.json";

mkdirSync("./content/resources", { recursive: true });

const groups: Record<string, string[]> = {};

for (const { docs, key, params, flags, overrides: { dataType, name } = {} } of routes) {
  const method = (key.match(/[A-Z][a-z]+/) ?? [])[0] ?? "";
  const routeKey = key.slice(method.length).replace("API", "");
  const prefix =
    method === "Get" && routeKey.endsWith("s")
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
                : "";
  const splitRoutes = routeKey.match(/[A-Z][a-z]+/g) ?? [];
  dataType ??
    `${flags?.includes("hasStringableContent") ? "string | " : ""}REST${key}JSONBody${
      flags?.includes("hasFiles")
        ? ` & { file${flags.includes("singlefile") ? "" : "s"}?: RawFile${flags.includes("singlefile") ? "" : "[]"} }`
        : ""
    }`;
  const resolvedName =
    name ??
    prefix +
      (splitRoutes.length > 1 ? splitRoutes.slice(1) : splitRoutes)
        .join("")
        .slice(0, routeKey.endsWith("s") && method !== "Get" ? -1 : undefined);
  const getVarName = resolvedName.replace(/[a-z]+/, "");

  const content = `
## [${resolvedName
    .match(/([A-Z]?[a-z]+|[A-Z]+(?![a-z]))/g)
    ?.map((w) => `${w[0].toUpperCase()}${w.slice(1)}`)
    .join(" ")}](${docs.see})
\`${key}\`

${docs.description}

\`\`\`ts
import { ${resolvedName} } from "dressed";
${method === "Get" ? `const ${getVarName[0].toLowerCase()}${getVarName.slice(1)} = ` : ""}await ${resolvedName}(${params
    .filter((p) => !p.includes("<"))
    .map((p) => `${/^(url|var)\./.test(p) ? p.slice(4) : p}`.split(":")[0])
    .join(", ")});
\`\`\`

${docs.infos?.map((i) => `> [!INFO]\n> ${i}`).join("\n") ?? ""}
${docs.warns?.map((i) => `> [!WARNING]\n> ${i}`).join("\n") ?? ""}
${docs.dangers?.map((i) => `> [!DANGER]\n> ${i}`).join("\n") ?? ""}
`
    .trim()
    .replace(/\/docs/g, "https://discord.com/developers$&");

  const url = new URL(docs.see, "http://0");
  const segments = url.pathname.split("/").filter(Boolean);
  const file = segments.pop() ?? "misc";

  groups[file] ??= [];
  groups[file].push(content);
}

for (const [file, contents] of Object.entries(groups)) {
  writeFileSync(`./content/resources/${file}.md`, contents.join("\n\n"));
}
