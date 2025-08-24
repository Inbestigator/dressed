import { walkFiles } from "walk-it";
import ora from "ora";
import {
  appendFileSync,
  existsSync,
  writeFileSync,
  readdirSync,
  mkdirSync,
  rmSync,
} from "node:fs";
import { cwd, stdout } from "node:process";
import { basename, extname, relative, resolve } from "node:path";
import { parseCommands } from "./parsers/commands.ts";
import { parseComponents } from "./parsers/components.ts";
import { parseEvents } from "./parsers/events.ts";
import type {
  CommandData,
  ComponentData,
  EventData,
  ServerConfig,
} from "../../types/config.ts";
import type { WalkEntry } from "../../types/walk.ts";
import { botEnv } from "../../utils/env.ts";
import { getApp } from "../../resources/application.ts";
import bundleFiles from "./bundle.ts";
import { pathToFileURL } from "node:url";

function override<T>(a: Partial<T>, b: Partial<T>): Partial<T> {
  const result = { ...a };

  for (const key in b) {
    const k = key as keyof T;
    const bv = b[k];
    const av = a[k];

    if (
      bv !== undefined &&
      typeof bv === "object" &&
      bv !== null &&
      !Array.isArray(bv)
    ) {
      result[k] = override(av ?? {}, bv) as T[typeof k];
    } else if (bv !== undefined) {
      result[k] = bv as T[typeof k];
    }
  }

  return result;
}

/**
 * Builds the bot imports and other variables.
 */
export default async function build(config: ServerConfig = {}): Promise<{
  commands: CommandData[];
  components: ComponentData[];
  events: EventData[];
  config: ServerConfig;
}> {
  rmSync(".dressed/cache", { recursive: true, force: true });
  mkdirSync(".dressed/cache", { recursive: true });
  await fetchMissingVars();
  const configPath = readdirSync(".").find(
    (f) => basename(f, extname(f)) === "dressed.config",
  );

  if (configPath) {
    await bundleFiles([configPath]);
    const { default: importedConfig } = await import(
      pathToFileURL(".dressed/cache/dressed.config.js").href
    );
    config = override(importedConfig, config);
  } else {
    writeFileSync(
      ".dressed/cache/dressed.config.js",
      `export default ${JSON.stringify(config)}`,
    );
  }

  const files: string[] = [];

  for (const dir of [
    "commands",
    "components/buttons",
    "components/selects",
    "components/modals",
    "events",
  ]) {
    const path = `${config.build?.root ?? "src"}/${dir}`;
    if (existsSync(path)) {
      files.concat(
        (config.build?.extensions ?? ["js", "ts", "mjs"]).map(
          (e) => `${path}/**/*.${e}`,
        ),
      );
    }
  }

  await bundleFiles(files);

  const [commandFiles, componentFiles, eventFiles] = await Promise.all([
    fetchFiles("commands"),
    fetchFiles("components"),
    fetchFiles("events"),
  ]);
  const commands = await parseCommands(commandFiles);
  const components = await parseComponents(componentFiles);
  const events = await parseEvents(eventFiles);

  return { commands, components, events, config };
}

async function fetchFiles(dirName: string): Promise<WalkEntry[]> {
  const dirPath = resolve(".dressed/cache", dirName);

  if (!existsSync(dirPath)) {
    ora(
      `${dirName.slice(0, 1).toUpperCase() + dirName.slice(1)} directory not found`,
    ).warn();
    return [];
  }

  const filesArray: WalkEntry[] = [];
  for await (const file of walkFiles(dirPath, {
    filterFile: (f) => extname(f.name) === ".js",
  })) {
    const relativePath = relative(cwd(), file.path);
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

      const envLines: string[] = [
        "# Some required bot variables were missing, so they've been filled in automatically",
      ];
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
