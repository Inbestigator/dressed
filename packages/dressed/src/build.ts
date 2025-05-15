import { walkFiles } from "walk-it";
import ora from "ora";
import { appendFileSync, existsSync } from "node:fs";
import { cwd, stdout } from "node:process";
import { basename, extname, relative, resolve } from "node:path";
import { parseCommands } from "./bot/commands.ts";
import { parseComponents } from "./bot/components.ts";
import { parseEvents } from "./bot/events.ts";
import type {
  CommandData,
  ComponentData,
  EventData,
  ServerConfig,
} from "./types/config.ts";
import { botEnv } from "./env.ts";
import { getApp } from "./bot/resources/application.ts";

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
export async function build(config: ServerConfig = {}): Promise<{
  commands: CommandData[];
  components: ComponentData[];
  events: EventData[];
  config: ServerConfig;
}> {
  await fetchMissingVars();
  const [commandFiles, componentFiles, eventFiles] = await Promise.all([
    fetchFiles(config.root ?? "src", "commands"),
    fetchFiles(config.root ?? "src", "components"),
    fetchFiles(config.root ?? "src", "events"),
  ]);

  const commands = parseCommands(commandFiles);
  const components = parseComponents(componentFiles);
  const events = parseEvents(eventFiles);

  return { commands, components, events, config };
}

/**
 * Fetches the files from a directory and formats paths for import.
 */
async function fetchFiles(root: string, dirName: string): Promise<WalkEntry[]> {
  const dirPath = resolve(root, dirName);
  const wd = cwd();

  if (!existsSync(dirPath)) {
    ora(
      `${dirName.slice(0, 1).toUpperCase() + dirName.slice(1)} directory not found`,
    ).warn();
    return [];
  }

  const filesArray: WalkEntry[] = [];
  for await (const file of walkFiles(dirPath, {
    filterFile: (f) => /.+\.(js|ts|mjs|cjs)$/.test(f.name),
  })) {
    const relativePath = relative(wd, file.path);
    filesArray.push({
      name: basename(file.file.name, extname(file.file.name)),
      path: relativePath,
    });
  }

  return filesArray;
}

async function fetchMissingVars() {
  try {
    void botEnv.DISCORD_TOKEN;
    const missingVars: string[] = [];

    try {
      void botEnv.DISCORD_APP_ID;
    } catch {
      missingVars.push("DISCORD_APP_ID");
    }
    try {
      void botEnv.DISCORD_PUBLIC_KEY;
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

/**
 * Log a table of values with a title (two columns max)
 *
 * Witch magic
 */
export function trackParts(total: number, title1: string, title2 = "") {
  const col1 = [title1];
  const col2 = [title2];
  let leftN = total;
  return {
    addRow: (name: string, secondaryName?: string) => {
      --leftN;
      col1.push(
        `${total === 1 ? "-" : leftN === total - 1 ? "┌" : leftN === 0 ? "└" : "├"} ${name}`,
      );
      col2.push(secondaryName ?? "");
    },
    log: () => {
      const longests = [col1, col2].map((c) =>
        Math.max(...c.map((s) => s.length)),
      );
      console.log(
        `\n${new Array(total + 1)
          .fill(0)
          .map(
            (_, i) =>
              `${[
                [col1, longests[0], "padEnd"] as const,
                [col2, longests[1], "padStart"] as const,
              ]
                .map((p) =>
                  i === 0
                    ? `\x1b[4m${p[0][0]}\x1b[24m`[p[2]](p[1] + 9, " ")
                    : p[0][i][p[2]](p[1] ?? 0, " "),
                )
                .join("  ")}`,
          )
          .join("\n")}\n`,
      );
    },
  };
}
