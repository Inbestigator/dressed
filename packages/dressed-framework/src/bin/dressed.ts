#!/usr/bin/env node

import { rmSync, writeFileSync } from "node:fs";
import { exit } from "node:process";
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
  .option("-r, --register", "Include code to register commands")
  .option("-e, --endpoint <endpoint>", "The endpoint to listen on", "/")
  .option("-p, --port <port>", "The port to listen on", "3000")
  .option("-I, --include <includes...>", "Glob patterns for handler files", "**/*.{js,ts,mjs}")
  .example("build src/bot -i")
  .example('build --include "**/*.{ts,tsx}"')
  .example("build -p 8080 -e /api/bot")
  .action(
    async (
      root,
      {
        instance,
        register,
        endpoint,
        include,
        ...options
      }: {
        instance?: boolean;
        register?: boolean;
        endpoint: string;
        port: string;
        include: string | string[];
      },
    ) => {
      const port = Number.parseInt(options.port, 10);

      if (Number.isNaN(port) || port < 0 || port > 65_535) {
        throw new Error("Port must be a valid TCP/IP network port number (0-65535)");
      }

      const { commands, components, events, configPath } = await build({
        server: { endpoint, port },
        build: {
          root,
          include: typeof include === "string" ? [include] : include,
        },
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
${[categories.map((c) => c.map(generateFileImport)), generateCategoryExports(categories)].flat(2).join("")}
export { config };
${register ? "registerCommands(commands);" : ""}
${instance ? "createServer(commands, components, events);" : ""}`.trim();
      const jsContent = 'export * from "./index.mjs";';
      const typeContent =
        'import type { DressedConfig } from "@dressed/framework";import type { CommandData, ComponentData, EventData } from "dressed/server";export declare const commands: CommandData[];export declare const components: ComponentData[];export declare const events: EventData[];export declare const config: DressedConfig;';

      writeFileSync(".dressed/tmp/index.ts", outputContent);
      await bundleFiles(".dressed/tmp/index.ts", ".dressed");
      writeFileSync(".dressed/index.js", jsContent);
      writeFileSync(".dressed/index.d.ts", typeContent);
      rmSync(".dressed/tmp", { recursive: true, force: true });

      const instancePrefix = register ? "├" : "└";

      logger.succeed(
        "Assembled generated build",
        instance ? `\n${instancePrefix} Starts a server instance` : "",
        register ? "\n└ Registers commands" : "",
      );
    },
  );

program.parse(process.argv);
