import { mkdirSync, writeFileSync } from "node:fs";
import routeDefinitions, { routeKeyToMethodName } from "../packages/dressed/src/resources/make/data";

mkdirSync("./content/resources", { recursive: true });

const groups: Record<string, string[]> = {};

function makeCallouts(tag: string, docs: string[] = []) {
  if (!docs.length) return "";
  const lines = docs.map((i) => `>${docs.length > 1 ? " - " : " "}${i}`).join("\n");
  return `\n> [!${tag}]\n${lines}`;
}

for (const [key, { docs, params, overrides = {}, flags }] of Object.entries(routeDefinitions)) {
  const method = (/[A-Z][a-z]+/.exec(key) ?? [])[0] ?? "";
  const resolvedName = overrides.name ?? routeKeyToMethodName(method, key, overrides.keyNameStart);
  const getVarName = resolvedName.replace(/[a-z]+/, "");

  const content = `
## [${docs.see
    .split("#")[1]
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())}](${docs.see}) ${flags?.includes("deprecated") ? "- *Deprecated*" : ""}
\`${key}\`

${docs.description}

\`\`\`ts
import { ${resolvedName} } from "dressed";
${method === "Get" ? `const ${getVarName[0].toLowerCase()}${getVarName.slice(1)} = ` : ""}await ${resolvedName}(${params
    .filter((p) => !p.includes("<"))
    .map((p) => `${/^(url|var)\./.test(p) ? p.slice(4) : p}`.split(":")[0])
    .join(", ")});
\`\`\`

${makeCallouts("INFO", docs.infos)}
${makeCallouts("WARNING", docs.warns)}
${makeCallouts("DANGER", docs.dangers)}
`
    .trim()
    .replace(/\/docs/g, "https://discord.com/developers$&");

  const url = new URL(docs.see, "http://0");
  const segments = url.pathname.split("/").filter(Boolean);
  const file = segments.pop() ?? "misc";

  groups[file] ??= [
    `# ${file
      .split("-")
      .map((w) => `${w[0].toUpperCase()}${w.slice(1)}`)
      .join(" ")}`,
  ];
  groups[file].push(content);
}

for (const [file, contents] of Object.entries(groups)) {
  writeFileSync(`./content/resources/${file}.md`, contents.join("\n\n"));
}
