import { walk, type WalkEntry } from "@std/fs/walk";
import { yellow } from "@std/fmt/colors";
import loader from "../internal/loader.ts";
import { join } from "node:path";
import type { BotConfig } from "../exports/mod.ts";
import { readdirSync } from "node:fs";
import { cwd } from "node:process";

/**
 * Builds the bot imports and other variables.
 *
 * @param addInstance - Whether to add the instance creation code.
 */
export async function build(addInstance?: boolean): Promise<string> {
  const buildLoader = loader("Building");
  const commandFiles = await fetchCommands();
  const componentFiles = await fetchComponents();

  const files = commandFiles.concat(componentFiles);
  files.push({
    name: "bot.config.ts",
    path: "bot.config.ts",
    isDirectory: false,
    isFile: true,
    isSymlink: false,
  });

  const config = await fetchConfig();

  if (!config) {
    buildLoader.error();
    throw new Error("No bot config found");
  }

  const fileImports = files
    .map((f) => `import "./${f.path.replaceAll("\\", "/")}";`)
    .join("\n");

  const defineCommandFiles = commandFiles.length > 0
    ? `const commandFiles = ${JSON.stringify(commandFiles)};`
    : "";

  const defineComponentFiles = componentFiles.length > 0
    ? `const componentFiles = ${JSON.stringify(componentFiles)};`
    : "";

  const defineConfig = `const config = ${JSON.stringify(config)};`;

  const instanceImport = addInstance
    ? `import { createInstance } from "@inbestigator/discord-http";\nimport { env } from "node:process";`
    : "";

  const instanceCreation = addInstance
    ? `\nenv.REGISTER_COMMANDS = "true";\n\nawait createInstance(config, ${
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

  return await Array.fromAsync(
    walk("./src/commands", {
      exts: [".ts"],
      includeDirs: false,
    }),
  );
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

  return await Array.fromAsync(
    walk("./src/components", {
      exts: [".ts"],
      includeDirs: false,
    }),
  );
}
