import { walkFiles } from "@svarta/walk-it";
import { underline } from "@std/fmt/colors";
import ora from "ora";
import type { ServerConfig } from "../server-mod.ts";
import { existsSync } from "node:fs";
import { cwd, stdout } from "node:process";
import { normalize } from "node:path";
import { parseCommands } from "./bot/commands.ts";
import { parseComponents } from "./bot/components.ts";
import type { BuildCommand, BuildComponent } from "../internal/types/config.ts";

export type WalkEntry = {
  name: string;
  path: string;
};

/**
 * Builds the bot imports and other variables.
 *
 * @param addInstance - Whether to add the instance creation code.
 * @param registerCommands - Whether to register slash commands.
 */
export async function build(
  addInstance?: boolean,
  registerCommands?: boolean,
  config: ServerConfig = {},
): Promise<string> {
  const [commandFiles, componentFiles] = await Promise.all([
    fetchFiles(`${config.root ?? "src"}/commands`),
    fetchFiles(`${config.root ?? "src"}/components`),
  ]);

  const commandData = commandFiles.length > 0
    ? parseCommands(commandFiles)
    : [];
  const componentData = componentFiles.length > 0
    ? parseComponents(componentFiles, config.root ?? "src")
    : [];
  const buildLoader = ora({
    stream: stdout,
    text: "Assembling generated build",
  }).start();

  const outputContent = `
${generateImports(addInstance, registerCommands)}

${defineExport("commandData", commandData)}
${defineExport("componentData", componentData)}
${defineExport("config", config, false)}
${registerCommands ? `\ninstallCommands(commandData);\n` : ""}
${addInstance ? generateInstanceCreation() : ""}
`.trim();

  buildLoader.succeed("Assembled generated build");
  return outputContent;
}

/**
 * Fetches the files from a directory and formats paths for import.
 */
async function fetchFiles(directory: string): Promise<WalkEntry[]> {
  directory = normalize(directory);
  if (!existsSync(directory)) {
    ora(`${directory} directory not found`).warn();
    return [];
  }

  const filesArray = [];
  for await (
    const file of walkFiles(directory, {
      filterFile: (f) => /.+\.(js|ts|mjs|cjs)$/.test(f.name),
    })
  ) {
    filesArray.push({
      name: file.file.name.split(".")[0],
      path: file.path.replace(cwd(), "").replaceAll("\\", "/").split("/").slice(
        1,
      ).join("/"),
    });
  }
  return filesArray;
}

function defineExport<
  T extends ServerConfig | BuildCommand[] | BuildComponent[],
>(
  variableName: string,
  content: T,
  pathToImport = true,
): string {
  return `export const ${variableName} = ${
    pathToImport
      ? JSON.stringify(content).replaceAll(
        /"path":"(.+?)"/g,
        '"import": ()=>import("./$1")',
      )
      : JSON.stringify(content)
  };`;
}

const generateImports = (
  addInstance?: boolean,
  registerCommands?: boolean,
) =>
  (addInstance || registerCommands)
    ? `import { ${
      addInstance
        ? `createServer${
          registerCommands ? ", installCommands" : ""
        }, setupCommands, setupComponents`
        : registerCommands
        ? "installCommands"
        : ""
    } } from "@dressed/dressed/server";`
    : "";

function generateInstanceCreation(): string {
  return `createServer(setupCommands(commandData), setupComponents(componentData), config);
`.trim();
}

export function trackParts(
  total: number,
  title1: string,
  title2 = "",
) {
  const col1 = [title1];
  const col2 = [title2];
  let leftN = total;
  return {
    removeN: () => {
      --leftN;
    },
    addRow: (name: string, secondaryName?: string) => {
      col1.push(
        `${
          total === 1
            ? "-"
            : leftN === total - 1
            ? "┌"
            : leftN === 0
            ? "└"
            : "├"
        } ${name}`,
      );
      col2.push(secondaryName ?? "");
    },
    log: () => {
      const longests = [col1, col2].map((c) =>
        Math.max(...(c.map((s) => s.length)))
      );
      console.log(
        `\n${
          new Array(total + 1)
            .fill(0)
            .map(
              (_, i) =>
                `${
                  [
                    [col1, longests[0], "padEnd"] as const,
                    [col2, longests[1], "padStart"] as const,
                  ]
                    .map((p) =>
                      i === 0
                        ? underline(p[0][0])[p[2]](p[1] + 9, " ")
                        : p[0][i][p[2]](p[1], " ")
                    )
                    .join("  ")
                }`,
            )
            .join("\n")
        }\n`,
      );
    },
  };
}
