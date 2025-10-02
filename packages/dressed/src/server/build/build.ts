import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { basename, extname, relative, resolve } from "node:path";
import { cwd } from "node:process";
import { walkFiles } from "walk-it";
import { getApp } from "../../resources/generated.resources.ts";
import type { CommandData, ComponentData, EventData, ServerConfig } from "../../types/config.ts";
import type { WalkEntry } from "../../types/walk.ts";
import { botEnv } from "../../utils/env.ts";
import { logDefer, logWarn } from "../../utils/log.ts";
import bundleFiles from "./bundle.ts";
import { parseCommands } from "./parsers/commands.ts";
import { parseComponents } from "./parsers/components.ts";
import { parseEvents } from "./parsers/events.ts";

export function importString(file: WalkEntry) {
  return `import * as h${file.uid} from "${relative(".dressed/tmp", file.path).replace(/\\/g, "/")}";`;
}

export function categoryExports(categories: WalkEntry[][]) {
  return categories.map(
    (c, i) =>
      `export const ${["commands", "components", "events"][i]} = [${c.map((f) => JSON.stringify({ ...f, exports: null }).replace('"exports":null', `"exports":h${f.uid}`))}];`,
  );
}

function override<T>(a: Partial<T>, b: Partial<T>): Partial<T> {
  const result = { ...a };

  for (const key in b) {
    const k = key as keyof T;
    const bv = b[k];
    const av = a[k];

    if (bv !== undefined && typeof bv === "object" && bv !== null && !Array.isArray(bv)) {
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
export default async function build(
  config: ServerConfig = {},
  { bundle = bundleFiles }: { bundle?: typeof bundleFiles } = {},
): Promise<{
  commands: CommandData[];
  components: ComponentData[];
  events: EventData[];
  config: ServerConfig;
}> {
  mkdirSync(".dressed/tmp", { recursive: true });
  await fetchMissingVars();
  const configPath = readdirSync(".").find((f) => basename(f, extname(f)) === "dressed.config");
  const configOutPath = ".dressed/tmp/dressed.config.mjs";

  if (configPath) {
    await bundle(configPath, ".dressed/tmp");
    const { default: importedConfig } = await import(resolve(configOutPath));
    config = override(importedConfig, config);
  } else {
    writeFileSync(configOutPath, `export default ${JSON.stringify(config)}`);
  }

  const root = config.build?.root ?? "src";
  const categories = ["commands", "components", "events"];
  const files = await Promise.all(
    categories.map((d) => fetchFiles(root, d, config.build?.extensions ?? ["js", "ts", "mjs"])),
  );
  const entriesPath = ".dressed/tmp/entries.ts";

  writeFileSync(entriesPath, [files.map((c) => c.map(importString)), categoryExports(files)].flat(2).join(""));
  logDefer("Bundling handlers");
  await bundle(entriesPath, ".dressed/tmp");
  const { commands, components, events } = await import(resolve(entriesPath.replace(".ts", ".mjs")));

  console.log(); // This just adds a newline before the logged trees for consistency
  return {
    commands: parseCommands(commands, `${root}/commands`),
    components: parseComponents(components, `${root}/components`),
    events: parseEvents(events, `${root}/events`),
    config,
  };
}

async function fetchFiles(root: string, dir: string, extensions: string[]): Promise<WalkEntry[]> {
  const dirPath = resolve(root, dir);

  if (!existsSync(dirPath)) {
    logWarn(`${dir.slice(0, 1).toUpperCase() + dir.slice(1)} directory not found`);
    return [];
  }

  const filesArray: WalkEntry[] = [];
  for await (const file of walkFiles(dirPath, {
    filterFile: (f) => extensions.includes(extname(f.name).slice(1)),
  })) {
    const path = relative(cwd(), file.path);
    filesArray.push({
      name: basename(path, extname(path)),
      uid: createHash("sha1").update(path).digest("hex"),
      path,
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
      logDefer(`Fetching missing variables (${missingVars.join(", ")})`);

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
    }
  } catch {
    //
  }
}
