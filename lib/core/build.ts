import { walkFiles } from "@svarta/walk-it";
import { yellow } from "@std/fmt/colors";
import ora from "ora";
import { join, normalize } from "node:path";
import type { BotConfig } from "../exports/mod.ts";
import { readdirSync } from "node:fs";
import { cwd } from "node:process";

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
  const buildLoader = ora("Building").start();

  const [commandFiles, componentFiles, config] = await Promise.all([
    fetchFiles("src/commands"),
    fetchFiles("src/components"),
    fetchConfig(),
  ]);

  if (!config) {
    buildLoader.fail();
    throw new Error("No bot config found");
  }

  const outputContent = `
${generateImports(config, addInstance, registerCommands)}
${generateFileImports([...commandFiles, ...componentFiles])}

${defineFiles("commandFiles", commandFiles)}
${defineFiles("componentFiles", componentFiles)}
const config = ${JSON.stringify(config)};

${
    addInstance
      ? generateInstanceCreation(
        commandFiles,
        componentFiles,
        config,
        registerCommands,
      )
      : ""
  }
`.trim();

  buildLoader.succeed();
  return outputContent;
}

async function fetchConfig(): Promise<BotConfig | undefined> {
  try {
    const configModule = await import(
      (typeof Deno !== "undefined" ? "file:" : "") +
        normalize(join(cwd(), "bot.config.ts"))
    );
    return configModule.default;
  } catch (error) {
    console.error("Error loading bot.config.ts:", error);
    return;
  }
}

/**
 * Fetches the files from a directory and formats paths for import.
 */
export async function fetchFiles(directory: string): Promise<WalkEntry[]> {
  try {
    readdirSync(`./${directory}`);
  } catch {
    console.warn(`${yellow("!")} ${directory} directory not found`);
    return [];
  }

  const filesArray = [];
  for await (
    const file of walkFiles(`./${directory}`, {
      filterFile: (f) => f.name.endsWith(".ts"),
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

function generateFileImports(files: WalkEntry[]): string {
  return files.map((f) => `import "./${f.path}";`).join("\n");
}

function defineFiles(variableName: string, files: WalkEntry[]): string {
  return files.length > 0
    ? `const ${variableName} = ${JSON.stringify(files)};`
    : "";
}

function generateImports(
  config: BotConfig,
  addInstance?: boolean,
  registerCommands?: boolean,
): string {
  const baseImport = addInstance
    ? `import { createInstance${
      config.deno === false ? "" : ", createServer"
    } } from "@inbestigator/discord-http";`
    : "";
  const processEnvImport = registerCommands
    ? `import { env } from "node:process";`
    : "";
  return [baseImport, processEnvImport].filter(Boolean).join("\n");
}

function generateInstanceCreation(
  commandFiles: WalkEntry[],
  componentFiles: WalkEntry[],
  config: BotConfig,
  registerCommands?: boolean,
): string {
  const registerEnv = registerCommands
    ? `env.REGISTER_COMMANDS = "true";\n`
    : "";
  const commandArray = commandFiles.length > 0 ? "commandFiles" : "[]";
  const componentArray = componentFiles.length > 0 ? "componentFiles" : "[]";
  return `
${registerEnv}
async function startServer() {
  const { runCommand, runComponent } = await createInstance(${commandArray}, ${componentArray});
  ${
    config.deno === false
      ? 'console.warn("You will need to set up your own server if not on Deno.");'
      : "createServer(runCommand, runComponent, config);"
  }
}
  
startServer();
`.trim();
}
