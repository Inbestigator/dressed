#!/usr/bin/env node

import { existsSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { exit } from "node:process";
import { bulkOverwriteGuildCommands } from "dressed";
import { logger } from "dressed/utils";
import sade from "sade";
import build from "../build/build.ts";
import bundleFiles from "../build/bundle.ts";
import { generateCategoryExports, generateFileImport, normalizeImportPath } from "../build/utils.ts";

const program = sade("dressed").describe("A sleek, serverless-ready Discord bot framework.");

program
  .command("build [root]")
  .describe(["Builds the bot and writes to .dressed", "[root]: Source root for the bot (default src)"])
  .option("-i, --instance", "Include code to start a server instance")
  .option(
    "-r, --register",
    "Include code to register commands, this will also remove all guild commands from guilds that are changing before they're re-registered",
  )
  .option("-e, --endpoint <endpoint>", "The endpoint to listen on (default /)")
  .option("-p, --port <port>", "The port to listen on (default 3000)")
  .option("-I, --include <includes...>", "Glob patterns for handler files (default **/*.{js,ts,mjs})")
  .option(
    "--flat-components",
    "Look for component handler folders within the root. If true, [root]/buttons/hello.ts ≈ [root]/components/buttons/hello.ts (default true)",
  )
  .example("build src/bot -i")
  .example('build --include "**/*.{ts,tsx}"')
  .example("build -p 8080 -e /api/bot")
  .example("build bot --no-flat-components")
  .action(
    async (
      root,
      {
        instance,
        register,
        endpoint,
        port: rawPort,
        include,
        "flat-components": flatComponents,
      }: {
        instance?: boolean;
        register?: boolean;
        endpoint?: string;
        port?: string;
        include?: string | string[];
        "flat-components": boolean;
      },
    ) => {
      const port = rawPort ? Number.parseInt(rawPort, 10) : undefined;

      if (port !== undefined && (Number.isNaN(port) || port < 0 || port > 65_535)) {
        throw new Error("Port must be a valid TCP/IP network port number (0-65535)");
      }

      const { commands, components, events, configPath } = await build({
        server: { endpoint, port },
        build: { root, include: typeof include === "string" ? [include] : include, flatComponents },
      });
      const categories = [commands, components, events];
      const outputContent = `
${
  instance || register
    ? `import { ${[instance && "createServer", register && "registerCommands"].filter(Boolean)} } from "dressed/server";`
    : ""
}
import { config as dressedConfig } from "dressed/utils";
import config from "${configPath ? normalizeImportPath(configPath) : "./dressed.config.mjs"}";
Object.assign(dressedConfig, config);
${[
  categories.map((c, i) =>
    Object.values(c)
      .flatMap((f) => (i === 1 ? Object.values(f) : f))
      .map(generateFileImport),
  ),
  generateCategoryExports(categories),
]
  .flat(2)
  .join("")}
export { config };
${register ? "registerCommands(commands);" : ""}
${instance ? "createServer(commands, components, events);" : ""}`.trim();
      const jsContent = 'export * from "./index.mjs";';
      const typeContent =
        'import type { DressedConfig } from "@dressed/framework";import type { CommandData, ComponentData, EventData } from "dressed/server";export declare const commands: CommandData[];export declare const components: ComponentData[];export declare const events: EventData[];export declare const config: DressedConfig;';
      const outPath = ".dressed/index.js";

      // Deregister guild commands if they're going away
      if (register && existsSync(outPath)) {
        const { commands: prevCommands } = (await import(resolve(outPath))) as { commands: typeof commands };
        const promiseMap: Record<string, Promise<unknown>> = {};
        for (const [name, prev] of Object.entries(prevCommands)) {
          if (prev.config?.guilds) {
            const curr = commands[name];
            const diff = prev.config.guilds.filter((g) => !curr?.config?.guilds?.includes(g));
            for (const guild of diff) {
              promiseMap[guild] ??= bulkOverwriteGuildCommands(guild, []);
            }
          }
        }
        const promises = Object.values(promiseMap);
        if (promises.length) {
          logger.defer("Deregistering old guild commands");
          await Promise.all(promises);
          logger.succeed("Removed old guild commands");
        }
      }

      writeFileSync(".dressed/tmp/index.ts", outputContent);
      await bundleFiles(".dressed/tmp/index.ts", ".dressed");
      writeFileSync(outPath, jsContent);
      writeFileSync(".dressed/index.d.ts", typeContent);
      rmSync(".dressed/tmp", { recursive: true, force: true });

      logger.succeed(
        "Assembled generated build",
        instance ? `\n${register ? "├" : "└"} Starts a server instance` : "",
        register ? "\n└ Registers commands" : "",
      );

      exit();
    },
  );

program.parse(process.argv);
