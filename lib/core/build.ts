import { walkFiles } from "@svarta/walk-it";
import { underline, yellow } from "@std/fmt/colors";
import ora from "ora";
import { join, normalize } from "node:path";
import type { BotConfig } from "../mod.ts";
import { existsSync } from "node:fs";
import { cwd } from "node:process";
import { runtime } from "std-env";
import { parseCommands } from "./bot/commands.ts";
import { parseComponents } from "./bot/components.ts";
import type {
  BuildCommand,
  BuildComponent,
  Component,
} from "../internal/types/config.ts";

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

  const commandData = commandFiles.length > 0
    ? parseCommands(commandFiles)
    : [];
  const componentData = componentFiles.length > 0
    ? parseComponents(componentFiles)
    : [];
  const buildLoader = ora("Assembling generated build").start();

  if (!config) {
    buildLoader.warn(
      "Could not determine bot config\n└ Maybe you didn't add a default export from bot.config.ts",
    ).start();
  }

  const outputContent = `
${generateImports(addInstance, registerCommands)}

${defineFiles("commandData", commandData)}
${defineFiles("componentData", componentData)}
const config = ${JSON.stringify(config ?? {})};

${
    addInstance
      ? generateInstanceCreation(
        commandData,
        componentData,
        registerCommands,
      )
      : ""
  }
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
    console.warn(`${yellow("!")} ${directory} directory not found`);
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
      path: file.path
        .replace(cwd(), "")
        .replaceAll("\\", "/")
        .split("/")
        .slice(1)
        .join("/"),
    });
  }
  return filesArray;
}

function defineFiles<T extends BuildCommand | Component>(
  variableName: string,
  files: T[],
): string {
  return files.length > 0
    ? `const ${variableName} = ${
      JSON.stringify(files).replaceAll(
        /"path":"(.+?)"/g,
        '"import": ()=>import("./$1")',
      )
    };`
    : "";
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

function generateInstanceCreation(
  commandData: BuildCommand[],
  componentData: BuildComponent[],
  registerCommands?: boolean,
): string {
  const registerEnv = registerCommands
    ? `env.REGISTER_COMMANDS = "true";\n`
    : "";
  const commandArray = commandData.length > 0 ? "commandData" : "[]";
  const componentArray = componentData.length > 0 ? "componentData" : "[]";
  return `
${registerEnv}
async function startServer() {
  const { runCommand, runComponent } = await createHandlers(${commandArray}, ${componentArray});
  createServer(runCommand, runComponent, config);
}
  
startServer();
`.trim();
}

export function trackParts(title: string, total: number) {
  const generatedStr: string[][] = [[underline(title)]];
  let leftN = total;
  return {
    removeN: () => {
      --leftN;
    },
    addRow: (name: string) => {
      generatedStr.push([
        total === 1 ? "-" : leftN === total - 1 ? "┌" : leftN === 0 ? "└" : "├",
        name,
      ]);
    },
    log: () => {
      console.log(`\n${generatedStr.map((row) => row.join(" ")).join("\n")}\n`);
    },
  };
}
