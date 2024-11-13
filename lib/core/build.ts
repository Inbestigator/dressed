import { walkFiles } from "@svarta/walk-it";
import { yellow } from "@std/fmt/colors";
import loader from "../internal/loader.ts";
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
 */
export async function build(
  addInstance?: boolean,
  registerCommands?: boolean,
): Promise<string> {
  const buildLoader = loader("Building");
  const commandFiles = await fetchCommands();
  const componentFiles = await fetchComponents();

  const files = commandFiles.concat(componentFiles);
  files.push({
    name: "bot.config.ts",
    path: "bot.config.ts",
  });

  const config = await fetchConfig();

  if (!config) {
    buildLoader.error();
    throw new Error("No bot config found");
  }

  const fileImports = files.map((f) => `import "./${f.path}";`).join("\n");

  const defineCommandFiles = commandFiles.length > 0
    ? `const commandFiles = ${JSON.stringify(commandFiles)};`
    : "";

  const defineComponentFiles = componentFiles.length > 0
    ? `const componentFiles = ${JSON.stringify(componentFiles)};`
    : "";

  const defineConfig = `const config = ${JSON.stringify(config)};`;

  const instanceImport = addInstance
    ? `import { createInstance } from "@inbestigator/discord-http";${
      registerCommands ? '\nimport { env } from "node:process"' : ""
    };`
    : "";

  const instanceCreation = addInstance
    ? `${
      registerCommands ? '\nenv.REGISTER_COMMANDS = "true";' : ""
    }\n\ncreateInstance(config, ${
      commandFiles.length > 0 ? "commandFiles" : "[]"
    }, ${componentFiles.length > 0 ? "componentFiles" : "[]"});`
    : "";

  const outputContent = `
${instanceImport}
${fileImports}

${defineCommandFiles}
${defineComponentFiles}
${defineConfig}
${instanceCreation}
  `.trim();

  buildLoader.resolve();
  return outputContent;
}

/**
 * Fetches the bot config from the bot.config.ts file
 *
 * @returns The bot config
 */
export async function fetchConfig(): Promise<BotConfig | undefined> {
  const configPath = join("file://", cwd(), "bot.config.ts");

  try {
    const configModule = await import(configPath);
    const config = configModule.default;
    if (!config) {
      throw new Error("Config not found in bot.config.ts");
    }
    return config;
  } catch (error) {
    console.error("Error loading bot.config.ts:", error);
    return;
  }
}

/**
 * Fetches the commands from the src/commands directory
 *
 * @returns A list of command files
 */
export async function fetchCommands(): Promise<WalkEntry[]> {
  try {
    readdirSync("./src/commands");
  } catch {
    console.warn(` ${yellow("!")} src/commands directory not found`);
    return [];
  }

  const filesArray = [];
  for await (
    const file of walkFiles("./src/commands", {
      filterFile: (f) => f.name.endsWith(".ts"),
    })
  ) {
    filesArray.push(file);
  }

  return filesArray.map((f) => ({
    name: f.file.name.split(".")[0],
    path: f.path
      .replace(cwd(), "")
      .replaceAll("\\", "/")
      .split("/")
      .slice(1)
      .join("/"),
  }));
}

/**
 * Fetches the components from the src/components directory
 *
 * @returns A list of component files
 */
export async function fetchComponents(): Promise<WalkEntry[]> {
  try {
    readdirSync("./src/components");
  } catch {
    console.warn(` ${yellow("!")} src/components directory not found`);
    return [];
  }

  const filesArray = [];
  for await (
    const file of walkFiles("./src/components", {
      filterFile: (f) => f.name.endsWith(".ts"),
    })
  ) {
    filesArray.push(file);
  }

  return filesArray.map((f) => ({
    name: f.file.name.split(".")[0],
    path: f.path
      .replace(cwd(), "")
      .replaceAll("\\", "/")
      .split("/")
      .slice(1)
      .join("/"),
  }));
}
