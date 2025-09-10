import { walkFiles } from "walk-it";
import ora from "ora";
import {
  appendFileSync,
  existsSync,
  writeFileSync,
  readdirSync,
  mkdirSync,
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
import { createHash } from "node:crypto";

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
  mkdirSync(".dressed/tmp", { recursive: true });
  await fetchMissingVars();
  const configPath = readdirSync(".").find(
    (f) => basename(f, extname(f)) === "dressed.config",
  );
  const configOutPath = ".dressed/tmp/dressed.config.mjs";

  if (configPath) {
    await bundleFiles([{ in: configPath, out: "tmp/dressed.config" }]);
    const { default: importedConfig } = await import(resolve(configOutPath));
    config = override(importedConfig, config);
  } else {
    writeFileSync(configOutPath, `export default ${JSON.stringify(config)}`);
  }

  const root = config.build?.root ?? "src";
  const categories = ["commands", "components", "events"];
  const files = await Promise.all(
    categories.map((d) =>
      fetchFiles(root, d, config.build?.extensions ?? ["js", "ts", "mjs"]),
    ),
  );
  const entriesPath = ".dressed/tmp/entries.ts";

  writeFileSync(
    ".dressed/tmp/entries.ts",
    `${files
      .flat()
      .map((v) => `\nimport * as h${v.uid} from "${resolve(v.path)}";`)
      .join(
        "",
      )}${files.map((c, i) => `export const ${categories[i]} = [${c.map((f) => `${JSON.stringify(f).slice(0, -1)},exports:h${f.uid}}`)}]`).join(";")}`,
  );
  await bundleFiles([{ in: entriesPath, out: "tmp/entries" }]);
  const { commands, components, events } = await import(
    resolve(entriesPath.replace("ts", "mjs"))
  );

  return {
    commands: await parseCommands(commands),
    components: await parseComponents(components),
    events: await parseEvents(events),
    config,
  };
}

async function fetchFiles(
  root: string,
  dir: string,
  extensions: string[],
): Promise<WalkEntry[]> {
  const dirPath = resolve(root, dir);

  if (!existsSync(dirPath)) {
    ora(
      `${dir.slice(0, 1).toUpperCase() + dir.slice(1)} directory not found`,
    ).warn();
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
