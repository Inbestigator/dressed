#!/usr/bin/env node

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { cwd, exit, stdout } from "node:process";
import { processEnv } from "@next/env";
import { Command } from "commander";
import Enquirer from "enquirer";
import ora from "ora";
import build, { categoryExports, importString } from "../server/build/build.ts";
import bundleFiles from "../server/build/bundle.ts";

const program = new Command().name("dressed").description("A sleek, serverless-ready Discord bot framework.");

program
  .command("build")
  .description("Builds the bot and writes to .dressed")
  .option("-i, --instance", "Include an instance create in the generated file")
  .option("-r, --register", "Register slash commands")
  .option("-e, --endpoint <endpoint>", "The endpoint to listen on, defaults to `/`")
  .option("-p, --port <port>", "The port to listen on, defaults to `8000`")
  .option("-R, --root <root>", "Source root for the bot, defaults to `src`")
  .option(
    "-E, --extensions <extensions>",
    "Comma separated list of file extensions to include when bundling handlers, defaults to `js, ts, mjs`",
  )
  .action(async ({ instance, register, endpoint, port, root, extensions }) => {
    if (port && Number.isNaN(Number(port))) {
      ora("Port must be a valid number").fail();
      return;
    }
    const { commands, components, events } = await build({
      endpoint,
      port: port ? Number(port) : undefined,
      build: {
        root,
        extensions: extensions?.split(",").map((e: string) => e.trim()),
      },
    });
    const buildLoader = ora({
      stream: stdout,
      text: "Assembling generated build",
    }).start();
    const categories = [commands, components, events];

    const outputContent = `
${
  instance || register
    ? `import { ${
        instance ? `createServer${register ? ", installCommands" : ""}` : register ? "installCommands" : ""
      } } from "dressed/server";`
    : ""
}
import config from "./dressed.config.mjs";
${[categories.map((c) => c.map(importString)), categoryExports(categories, "null")].flat(2).join("")}
export { config };
${register ? "\ninstallCommands(commands);" : ""}
${instance ? `createServer(commands, components, events, config);` : ""}`.trim();
    const jsContent = 'export * from "./index.mjs";';
    const typeContent =
      'import type { CommandData, ComponentData, EventData, ServerConfig } from "dressed/server";export declare const commands: CommandData[];export declare const components: ComponentData[];export declare const events: EventData[];export declare const config: ServerConfig;';

    writeFileSync(".dressed/tmp/index.ts", outputContent);
    await bundleFiles(".dressed/tmp/index.ts", ".dressed");
    writeFileSync(".dressed/index.js", jsContent);
    writeFileSync(".dressed/index.d.ts", typeContent);
    rmSync(".dressed/tmp", { recursive: true, force: true });

    buildLoader.succeed("Assembled generated build");
    exit();
  });

program
  .command("create")
  .description("Clone a new bot from the examples repository")
  .argument("[name]", "Project name")
  .argument("[template]", "Template name (node/deno)")
  .action(async (name, template) => {
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

    const env = {
      path: ".",
      env: {},
      contents: await res.text(),
    };

    processEnv([env], "./", undefined, true);

    const envVars = await prompt(
      Object.entries(env.env).map(([k, v]) => ({
        type: /TOKEN|PASSWORD/.test(k) ? "password" : "text",
        name: k,
        message: k,
        initial: v as string,
      })),
    );

    const mkdirLoader = ora(`Creating files for project: ${name}`).start();

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
    } catch {
      mkdirLoader.fail();
      return;
    }
    mkdirLoader.succeed();

    console.log("\x1b[32m%s", "Project created successfully.");
    exit();
  });

program.parse();
