#!/usr/bin/env node

import { rmSync, writeFileSync } from "node:fs";
import { exit } from "node:process";
import { Command, InvalidArgumentError } from "commander";
import { logger } from "dressed/utils";
import build from "../build/build.ts";
import bundleFiles from "../build/bundle.ts";
import { categoryExports, importFileString, normalizeImportPath } from "../utils.ts";

const program = new Command().name("dressed").description("A sleek, serverless-ready Discord bot framework.");

program
  .command("build")
  .description("Builds the bot and writes to .dressed")
  .option("-i, --instance", "Include code to start a server instance")
  .option("-r, --register", "Include code to register commands")
  .option("-e, --endpoint <endpoint>", "The endpoint to listen on, defaults to `/`")
  .option("-p, --port <port>", "The port to listen on, defaults to `8000`", (v) => {
    const parsed = Number.parseInt(v, 10);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 65_535) {
      throw new InvalidArgumentError("Port must be a valid TCP/IP network port number (0-65535)");
    }
    return parsed;
  })
  .option("-R, --root <root>", "Source root for the bot, defaults to `src`")
  .option(
    "-E, --extensions <extensions>",
    "Comma separated list of file extensions to include when bundling handlers, defaults to `js, ts, mjs`",
  )
  .action(
    async ({
      instance,
      register,
      endpoint,
      port,
      root,
      extensions,
    }: {
      instance?: boolean;
      register?: boolean;
      endpoint?: string;
      port?: number;
      root?: string;
      extensions?: string;
    }) => {
      const { commands, components, events, configPath } = await build({
        endpoint,
        port,
        build: { root, extensions: extensions?.split(",").map((e: string) => e.trim()) },
      });
      const categories = [commands, components, events];

      const outputContent = `
${
  instance || register
    ? `import { ${[instance && "createServer", register && "registerCommands"].filter(Boolean)} } from "dressed/server";`
    : ""
}
import { serverConfig } from "dressed/utils";
import config from "${configPath ? normalizeImportPath(configPath) : "./dressed.config.mjs"}";
Object.assign(serverConfig, config);
${[categories.map((c) => c.map(importFileString)), categoryExports(categories)].flat(2).join("")}
export { config };
${register ? "registerCommands(commands);" : ""}
${instance ? "createServer(commands, components, events);" : ""}`.trim();
      const jsContent = 'export * from "./index.mjs";';
      const typeContent =
        'import type { ServerConfig } from "@dressed/framework";import type { CommandData, ComponentData, EventData } from "dressed/server";export declare const commands: CommandData[];export declare const components: ComponentData[];export declare const events: EventData[];export declare const config: ServerConfig;';

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
      exit();
    },
  );
program.parse();
