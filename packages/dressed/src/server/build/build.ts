import { walkFiles } from "walk-it";
import ora from "ora";
import { appendFileSync, existsSync } from "node:fs";
import { cwd, stdout } from "node:process";
import { basename, extname, relative, resolve } from "node:path";
import { parseCommands } from "./parsers/commands.ts";
import { parseComponents } from "./parsers/components.ts";
import { parseEvents } from "./parsers/events.ts";
import type {
  BaseData,
  CommandData,
  ComponentData,
  EventData,
  ServerConfig,
} from "../../types/config.ts";
import { env } from "node:process";
import type { WalkEntry } from "../../types/walk.ts";
import { botEnv } from "../../utils/env.ts";
import { getApp } from "../../bot/resources/application.ts";

/**
 * Builds the bot imports and other variables.
 */
export default async function build(config: ServerConfig = {}): Promise<{
  commands: BaseData<CommandData>[];
  components: BaseData<ComponentData>[];
  events: BaseData<EventData>[];
  config: ServerConfig;
}> {
  env.DRESSED_ROOT = config.root ?? "src";
  await fetchMissingVars();
  const [commandFiles, componentFiles, eventFiles] = await Promise.all([
    fetchFiles(config.root ?? "src", "commands"),
    fetchFiles(config.root ?? "src", "components"),
    fetchFiles(config.root ?? "src", "events"),
  ]);

  const commands = await parseCommands(commandFiles);
  const components = await parseComponents(componentFiles);
  const events = await parseEvents(eventFiles);

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
