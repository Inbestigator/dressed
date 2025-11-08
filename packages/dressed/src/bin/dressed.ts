#!/usr/bin/env node

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { cwd, exit } from "node:process";
import { Command, InvalidArgumentError } from "commander";
import { parse } from "dotenv";
import Enquirer from "enquirer";
import build from "../server/build/build.ts";
import bundleFiles from "../server/build/bundle.ts";
import { categoryExports, importString } from "../utils/build.ts";
import { logDefer, logError, logSuccess } from "../utils/log.ts";

const program = new Command().name("dressed").description("A sleek, serverless-ready Discord bot framework.");

program
  .command("build")
  .description("Builds the bot and writes to .dressed")
  .option("-i, --instance", "Include code to start a server instance")
  .option("-r, --register", "Include code to register commands")
  .option("-e, --endpoint <endpoint>", "The endpoint to listen on, defaults to `/`")
  .option("-p, --port <port>", "The port to listen on, defaults to `8000`", (v) => {
    const parsed = parseInt(v, 10);
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
      const { commands, components, events } = await build({
        endpoint,
        port,
        build: {
          root,
          extensions: extensions?.split(",").map((e: string) => e.trim()),
        },
      });
      const categories = [commands, components, events];

      const outputContent = `
${
  instance || register
    ? `import { ${
        instance ? `createServer${register ? ", installCommands" : ""}` : register ? "installCommands" : ""
      } } from "dressed/server";`
    : ""
}
import { serverConfig } from "dressed/utils";
import config from "./dressed.config.mjs";
Object.assign(serverConfig, config);
${[categories.map((c) => c.map(importString)), categoryExports(categories)].flat(2).join("")}
export { config };
${register ? "\ninstallCommands(commands);" : ""}
${instance ? `createServer(commands, components, events);` : ""}`.trim();
      const jsContent = 'export * from "./index.mjs";';
      const typeContent =
        'import type { CommandData, ComponentData, EventData, ServerConfig } from "dressed/server";export declare const commands: CommandData[];export declare const components: ComponentData[];export declare const events: EventData[];export declare const config: ServerConfig;';

      writeFileSync(".dressed/tmp/index.ts", outputContent);
      await bundleFiles(".dressed/tmp/index.ts", ".dressed");
      writeFileSync(".dressed/index.js", jsContent);
      writeFileSync(".dressed/index.d.ts", typeContent);
      rmSync(".dressed/tmp", { recursive: true, force: true });

      logSuccess(
        "Assembled generated build",
        instance ? `\n${register ? "├" : "└"} Starts a server instance` : "",
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
    if (!name) {
      name = (
        await prompt<{ name: string }>({
          type: "text",
          name: "name",
          message: "Project name:",
        })
      ).name;
    }
    if (!template || (!template.startsWith("node/") && !template.startsWith("deno/"))) {
      const res = await fetch("https://api.github.com/repos/inbestigator/dressed-examples/contents/node");
      if (!res.ok) {
        throw new Error("Failed to list templates.");
      }
      const files = ((await res.json()) as { name: string; path: string; type: string }[]).filter(
        (f) => f.type === "dir",
      );
      template = `node/${
        (
          await prompt<{ template: string }>({
            name: "template",
            type: "select",
            message: "Select the template to use",
            choices: files.map((f) => f.name),
          })
        ).template
      }`;
    }
    const res = await fetch(
      `https://raw.githubusercontent.com/inbestigator/dressed-examples/main/${template}/.env.example`,
    );
    if (!res.ok) {
      throw new Error("Failed to fetch env template.");
    }
    const envVars = await prompt(
      Object.entries(parse(await res.text())).map(([k, v]) => ({
        type: /TOKEN|PASSWORD/.test(k) ? "password" : "text",
        name: k,
        message: k,
        initial: v as string,
      })),
    );

    logDefer(`Creating files for project: ${name}`);

    async function createFiles(path: string, dest: string) {
      mkdirSync(dest, { recursive: true });
      const response = await fetch(path);

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const json = await response.json();
      if (Array.isArray(json)) {
        for (const file of json) {
          if (file.type === "dir") {
            await createFiles(file.url, join(dest, file.name));
          } else {
            const fileRes = await fetch(file.download_url);
            if (!fileRes.ok) {
              throw new Error(fileRes.statusText);
            }
            const fileContents = await fileRes.text();
            const destPath = join(dest, file.name);
            if (file.name === ".env.example") {
              const destPath = join(dest, ".env");
              mkdirSync(dirname(destPath), { recursive: true });
              writeFileSync(
                destPath,
                Object.entries(envVars)
                  .map(([k, v]) => `${k}="${v}"`)
                  .join("\n"),
              );
            }
            mkdirSync(dirname(destPath), { recursive: true });
            writeFileSync(destPath, fileContents);
          }
        }
      }
    }

    try {
      const path = `https://api.github.com/repos/inbestigator/dressed-examples/contents/${template}`;
      await createFiles(path, join(cwd(), name));
    } catch (e) {
      logError(e);
    }

    logSuccess("Project created successfully!");
    exit();
  });

program.parse();
