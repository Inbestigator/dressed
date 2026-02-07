import { appendFileSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { basename, extname, resolve } from "node:path";
import { getApp } from "dressed";
import { botEnv, config as dressedConfig, logger } from "dressed/utils";
import type { DressedConfig } from "../types/config.ts";
import bundleFiles from "./bundle.ts";
import { parseCommands } from "./parsers/commands.ts";
import { parseComponents } from "./parsers/components.ts";
import { parseEvents } from "./parsers/events.ts";
import { crawlDir, generateCategoryExports, generateFileImport } from "./utils.ts";

/**
 * Builds the bot imports and other variables.
 */
export default async function build(
  config: Omit<DressedConfig, "middleware"> = {},
  { bundle = bundleFiles }: { bundle?: typeof bundleFiles } = {},
): Promise<{
  commands: ReturnType<typeof parseCommands>;
  components: ReturnType<typeof parseComponents>;
  events: ReturnType<typeof parseEvents>;
  config: DressedConfig;
  configPath?: string;
}> {
  mkdirSync(".dressed/tmp", { recursive: true });
  await fetchMissingVars();
  const configPath = readdirSync(".").find((f) => basename(f, extname(f)) === "dressed.config");
  const configOutPath = ".dressed/tmp/dressed.config.mjs";

  if (configPath) {
    await bundle(configPath, ".dressed/tmp");
    const { default: importedConfig } = await import(resolve(configOutPath));
    config = override(importedConfig, config);
    Object.assign(dressedConfig, override(dressedConfig, config));
  } else {
    writeFileSync(configOutPath, `export default ${JSON.stringify(config)}`);
  }

  const root = config.build?.root ?? "src";
  const categories = ["commands", "components", "events"];
  const files = await Promise.all(categories.map((d) => crawlDir(root, d, config.build?.include)));
  const entriesPath = ".dressed/tmp/entries.ts";

  writeFileSync(
    entriesPath,
    [files.map((c) => c.map(generateFileImport)), generateCategoryExports(files)].flat(2).join(""),
  );
  logger.defer("Bundling handlers");
  await bundle(entriesPath, ".dressed/tmp");
  const { commands, components, events } = await import(resolve(entriesPath.replace(".ts", ".mjs")));

  logger.raw.log(); // This just adds a newline before the logged trees for consistency
  return {
    commands: parseCommands(commands, `${root}/commands`),
    components: parseComponents(components, `${root}/components`),
    events: parseEvents(events, `${root}/events`),
    config,
    configPath,
  };
}

async function fetchMissingVars() {
  try {
    void botEnv.DISCORD_TOKEN; // NOSONAR
    const missingVars: string[] = [];

    try {
      void botEnv.DISCORD_APP_ID; // NOSONAR
    } catch {
      missingVars.push("DISCORD_APP_ID");
    }
    try {
      void botEnv.DISCORD_PUBLIC_KEY; // NOSONAR
    } catch {
      missingVars.push("DISCORD_PUBLIC_KEY");
    }

    if (missingVars.length) {
      logger.defer(`Fetching missing variables (${missingVars.join(", ")})`);

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
    logger.error("Failed to fetch missing variables");
  }
}

/** Deep merges two objects, producing a new object where values from {@link b} override those from {@link a}. */
function override<T>(a: Partial<T>, b: Partial<T>) {
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
