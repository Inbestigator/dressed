#!/usr/bin/env node

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cwd, exit } from "node:process";
import { Command, InvalidArgumentError } from "commander";
import { parse } from "dotenv";
import { logger } from "dressed/utils";
import Enquirer from "enquirer";
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
        'import type { CommandData, ComponentData, EventData, ServerConfig } from "@dressed/framework";export declare const commands: CommandData[];export declare const components: ComponentData[];export declare const events: EventData[];export declare const config: ServerConfig;';

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

program
  .command("create")
  .description("Clone a new bot from the examples repository")
  .argument("[name]", "Project name")
  .argument("[template]", "Template name (node/deno)")
  .action(async (name?: string, template?: string) => {
    const { prompt } = Enquirer;
    const repo = "inbestigator/dressed-examples";

    if (!name) {
      name = (
        await prompt<{ name: string }>({
          type: "text",
          name: "name",
          message: "Project name:",
          initial: "my-bot",
          required: true,
        }).catch(() => exit(1))
      ).name;
    }
    if (!template || (!template.startsWith("node/") && !template.startsWith("deno/"))) {
      const dirsRes = await fetch(`https://api.github.com/repos/${repo}/contents/node`);
      if (!dirsRes.ok) throw new Error("Failed to list templates.");

      template = `node/${
        (
          await prompt<{ template: string }>({
            name: "template",
            type: "select",
            message: "Select the template to use",
            choices: ((await dirsRes.json()) as { name: string; path: string; type: string }[])
              .filter((f) => f.type === "dir")
              .map((f) => f.name),
            required: true,
          }).catch(() => exit(1))
        ).template
      }`;
    }

    const envRes = await fetch(`https://raw.githubusercontent.com/${repo}/main/${template}/.env.example`);
    if (!envRes.ok) throw new Error("Failed to fetch env template.");

    const envVars = await prompt(
      Object.entries(parse(await envRes.text())).map(([k, v]) => ({
        type: /TOKEN|PASSWORD|KEY/.test(k) ? "password" : "text",
        name: k,
        message: k,
        initial: v,
      })),
    ).catch(() => exit(1));

    logger.defer(`Creating files for project: ${name}`);

    async function createFiles(path: string, dest: string) {
      mkdirSync(dest, { recursive: true });
      const dirRes = await fetch(path);

      if (!dirRes.ok) throw new Error(dirRes.statusText);

      async function processFile(file: { type: string; url: string; name: string; download_url: string }) {
        if (file.type === "dir") {
          await createFiles(file.url, join(dest, file.name));
        } else {
          const fileRes = await fetch(file.download_url);
          if (!fileRes.ok) throw new Error(`Failed to fetch ${file.name}:  ${fileRes.statusText}`);

          let fileContents = await fileRes.text();
          let destPath = join(dest, file.name);

          switch (file.name) {
            case ".env.example":
              fileContents = Object.entries(envVars)
                .map(([k, v]) => `${k}="${v}"`)
                .join("\n");
              destPath = join(dest, ".env");
              break;
            case "package.json":
              fileContents = fileContents.replace(/("name": ").+"/, `$1${name}"`);
          }

          writeFileSync(destPath, fileContents);
        }
      }

      const json = await dirRes.json();
      if (Array.isArray(json)) await Promise.all(json.map(processFile));
    }

    try {
      await createFiles(`https://api.github.com/repos/${repo}/contents/${template}`, join(cwd(), name));
    } catch (e) {
      logger.error(e);
    }

    logger.succeed("Project created successfully!");
    exit();
  });

program.parse();
