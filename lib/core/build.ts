import { walkFiles } from "@svarta/walk-it";
import { yellow } from "@std/fmt/colors";
import ora from "ora";
import { join } from "node:path";
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
${generateImports(addInstance, registerCommands)}
${generateFileImports([...commandFiles, ...componentFiles])}

${defineFiles("commandFiles", commandFiles)}
${defineFiles("componentFiles", componentFiles)}
const config = ${JSON.stringify(config)};

${
    addInstance
      ? generateInstanceCreation(commandFiles, componentFiles, registerCommands)
      : ""
  }
`.trim();

  buildLoader.succeed();
  return outputContent;
}

/**
 * Fetches the bot config from the bot.config.ts file.
 */
async function fetchConfig(): Promise<BotConfig | undefined> {
  const configPath = join("file://", cwd(), "bot.config.ts");
  try {
    const configModule = await import(configPath);
    if (!configModule.default) {
      throw new Error("Config not found in bot.config.ts");
    }
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

/**
 * Generates import statements for all files.
 */
function generateFileImports(files: WalkEntry[]): string {
  return files.map((f) => `import "./${f.path}";`).join("\n");
}

/**
 * Defines variables for command and component files.
 */
function defineFiles(variableName: string, files: WalkEntry[]): string {
  return files.length > 0
    ? `const ${variableName} = ${JSON.stringify(files)};`
    : "";
}

/**
 * Generates necessary imports based on flags.
 */
function generateImports(
  addInstance?: boolean,
  registerCommands?: boolean,
): string {
  const baseImport = addInstance
    ? `import { createInstance, createServer } from "@inbestigator/discord-http";`
    : "";
  const processEnvImport = registerCommands
    ? `import { env } from "node:process";`
    : "";
  return [baseImport, processEnvImport].filter(Boolean).join("\n");
}

/**
 * Generates the instance creation and server start code.
 */
function generateInstanceCreation(
  commandFiles: WalkEntry[],
  componentFiles: WalkEntry[],
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
  if (config.deno === false) {
    console.log("You will need to set up your own server if not on Deno.");
  } else {
    createServer(runCommand, runComponent, config);
  }
}
  
startServer();
`.trim();
}
