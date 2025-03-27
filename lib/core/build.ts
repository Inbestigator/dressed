import { walkFiles } from "@svarta/walk-it";
import { underline } from "@std/fmt/colors";
import ora from "ora";
import { join, normalize } from "node:path";
import type { BotConfig } from "../mod.ts";
import { existsSync } from "node:fs";
import { cwd } from "node:process";
import { runtime } from "std-env";
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
): Promise<string> {
  const [commandFiles, componentFiles, config] = await Promise.all([
    fetchFiles("src/commands"),
    fetchFiles("src/components"),
    fetchConfig(),
  ]);

  if (!addInstance && registerCommands) {
    ora("Commands will not be registered without an instance").warn();
  }

  const commandData = commandFiles.length > 0
    ? parseCommands(commandFiles)
    : [];
  const componentData = componentFiles.length > 0
    ? parseComponents(componentFiles)
    : [];
  const buildLoader = ora("Assembling generated build").start();

  if (!config) {
    buildLoader
      .warn(
        "Could not determine bot config\n└ Maybe you didn't add a default export from bot.config.ts",
      )
      .start();
  }

  const outputContent = `
${generateImports(addInstance, registerCommands)}

${defineExport("commandData", commandData)}
${defineExport("componentData", componentData)}
${defineExport("config", config ?? {}, false)}
${registerCommands ? `\nenv.REGISTER_COMMANDS = "true";\n` : ""}
${addInstance ? generateInstanceCreation() : ""}
`.trim();

  buildLoader.succeed("Assembled generated build");
  return outputContent;
}

async function fetchConfig(): Promise<BotConfig | undefined> {
  try {
    const configModule = await import(
      (runtime !== "bun" ? "file:" : "") +
        normalize(join(cwd(), "bot.config.ts"))
    );
    return configModule.default;
  } catch {
    return;
  }
}

/**
 * Fetches the files from a directory and formats paths for import.
 */
async function fetchFiles(directory: string): Promise<WalkEntry[]> {
  if (!existsSync(`./${directory}`)) {
    ora(`${directory} directory not found`).warn();
    return [];
  }

  const filesArray = [];
  for await (
    const file of walkFiles(`./${directory}`, {
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

function defineExport<T extends BotConfig | BuildCommand[] | BuildComponent[]>(
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

function generateImports(
  addInstance?: boolean,
  registerCommands?: boolean,
): string {
  const baseImport = addInstance
    ? `import { createHandlers, createServer } from "@dressed/dressed/server";`
    : "";
  const processEnvImport = registerCommands
    ? `import { env } from "node:process";`
    : "";
  return [baseImport, processEnvImport].filter(Boolean).join("\n");
}

function generateInstanceCreation(): string {
  return `async function startServer() {
  const { runCommand, runComponent } = await createHandlers(commandData, componentData);
  createServer(runCommand, runComponent, config);
}
  
startServer();
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
