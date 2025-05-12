import { walkFiles } from "@svarta/walk-it";
import ora from "ora";
import { appendFileSync, existsSync } from "node:fs";
import { cwd, stdout } from "node:process";
import { normalize } from "node:path";
import { parseCommands } from "./bot/commands.ts";
import { parseComponents } from "./bot/components.ts";
import { parseEvents } from "./bot/events.ts";
import type {
  BuildCommand,
  BuildComponent,
  ServerConfig,
} from "../internal/types/config.ts";
import { botEnv } from "../internal/utils.ts";
import { getApp } from "./bot/application.ts";

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
  await fetchMissingVars();
  const [commandFiles, componentFiles, eventFiles] = await Promise.all([
    fetchFiles(`${config.root ?? "src"}/commands`),
    fetchFiles(`${config.root ?? "src"}/components`),
    fetchFiles(`${config.root ?? "src"}/events`),
  ]);

  const commandData = commandFiles.length > 0
    ? parseCommands(commandFiles)
    : [];
  const componentData = componentFiles.length > 0
    ? parseComponents(componentFiles, config.root ?? "src")
    : [];
  const eventData = eventFiles.length > 0 ? parseEvents(eventFiles) : [];
  const buildLoader = ora({
    stream: stdout,
    text: "Assembling generated build",
  }).start();

  const outputContent = `
${generateImports(addInstance, registerCommands)}

${defineExport("commandData", commandData)}
${defineExport("componentData", componentData)}
${defineExport("eventData", eventData)}
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
        }, setupCommands, setupComponents, setupEvents`
        : registerCommands
        ? "installCommands"
        : ""
    } } from "@dressed/dressed/server";`
    : "";

function generateInstanceCreation(): string {
  return `createServer(setupCommands(commandData), setupComponents(componentData), setupEvents(eventData), config);
`.trim();
}

async function fetchMissingVars() {
  try {
    botEnv.DISCORD_TOKEN;
    const missingVars: string[] = [];

    try {
      botEnv.DISCORD_APP_ID;
    } catch {
      missingVars.push("DISCORD_APP_ID");
    }
    try {
      botEnv.DISCORD_PUBLIC_KEY;
    } catch {
      missingVars.push("DISCORD_PUBLIC_KEY");
    }

    if (missingVars.length) {
      const varLoader = ora({
        stream: stdout,
        text: `Fetching missing variables (${missingVars.join(", ")})`,
      }).start();

      const app = await getApp();

      const envLines: string[] = ["# Missing required bot variable(s)"];
      if (missingVars.includes("DISCORD_APP_ID")) {
        envLines.push(`DISCORD_APP_ID="${app.id}"`);
      }
      if (missingVars.includes("DISCORD_PUBLIC_KEY")) {
        envLines.push(`DISCORD_PUBLIC_KEY="${app.verify_key}"`);
      }

      appendFileSync(".env", `\n${envLines.join("\n")}`);

      varLoader.succeed(
        `Fetched missing variables (${missingVars.join(", ")})`,
      );
    }
  } catch {
    //
  }
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
    addRow: (name: string, secondaryName?: string) => {
      --leftN;
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
                        ? `\x1b[4m${p[0][0]}\x1b[24m`[p[2]](p[1] + 9, " ")
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
