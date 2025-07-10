#!/usr/bin/env node

import ora from "ora";
import { Command } from "commander";
import { dirname, join, relative } from "node:path";
import { cwd, exit, stdout } from "node:process";
import { select, input, confirm } from "@inquirer/prompts";
import { parse } from "dotenv";
import { mkdirSync, writeFileSync } from "fs";
import build from "../server/build/build.ts";

const program = new Command()
  .name("dressed")
  .description("A sleek, serverless-ready Discord bot framework.");

program
  .command("build")
  .description("Builds the bot and writes to .dressed")
  .option("-i, --instance", "Include an instance create in the generated file")
  .option("-r, --register", "Register slash commands")
  .option(
    "-e, --endpoint <endpoint>",
    "The endpoint to listen on, defaults to `/`",
  )
  .option("-p, --port <port>", "The port to listen on, defaults to `8000`")
  .option("-R, --root <root>", "Source root for the bot, defaults to `src`")
  .option(
    "-E, --extensions <extensions>",
    "Comma separated list of file extensions to include when bundling handlers, defaults to `js, ts, mjs`",
  )
  .action(async ({ instance, register, endpoint, port, root, extensions }) => {
    if (port && isNaN(Number(port))) {
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

    const outputContent = `
${generateImports(instance, register)}
import config from "./cache/config.mjs";${[
      ...commands,
      ...components,
      ...events,
    ]
      .map(
        (v) =>
          `\nimport * as h${v.uid} from "./${relative(".dressed", v.path)}";`,
      )
      .join("")}

export const commands = [ ${commands.map((c) => JSON.stringify(c).replace("null", `h${c.uid}`))} ];
export const components = [ ${components.map((c) => JSON.stringify(c).replace("null", `h${c.uid}`))} ];
export const events = [ ${events.map((e) => JSON.stringify(e).replace("null", `h${e.uid}`))} ];
export { config };
${register ? "\ninstallCommands(commands);" : ""}
${instance ? `createServer(commands, components, events, config);` : ""}`.trim();
    const typeContent = `
import type { CommandData, ComponentData, EventData, ServerConfig } from "dressed/server";

export declare const commands: CommandData[];
export declare const components: ComponentData[];
export declare const events: EventData[];
export declare const config: ServerConfig;`;

    writeFileSync(".dressed/index.mjs", outputContent);
    writeFileSync(".dressed/index.d.ts", typeContent);

    buildLoader.succeed("Assembled generated build");
    exit(0);
  });

const generateImports = (addInstance?: boolean, registerCommands?: boolean) =>
  addInstance || registerCommands
    ? `import { ${
        addInstance
          ? `createServer${registerCommands ? ", installCommands" : ""}`
          : registerCommands
            ? "installCommands"
            : ""
      } } from "dressed/server";`
    : "";

program
  .command("create")
  .description("Clone a new bot from the examples repository")
  .argument("[template]", "Template name (deno/economy)")
  .argument("[name]", "Project name")
  .action(async (name, template) => {
    if (!name) {
      name = await input({
        message: "Project name:",
        required: true,
      });
    }
    if (
      !template ||
      (!template.startsWith("node/") && !template.startsWith("deno/"))
    ) {
      const isDeno = await confirm({
        message: "Would you like to use a Deno specific template?",
        default: false,
      });
      const res = await fetch(
        `https://api.github.com/repos/inbestigator/dressed-examples/contents/${
          isDeno ? "deno" : "node"
        }`,
      );
      if (!res.ok) {
        throw new Error("Failed to list templates.");
      }
      const files = (
        (await res.json()) as { name: string; path: string; type: string }[]
      ).filter((f) => f.type === "dir");
      template = await select({
        message: "Select the template to use",
        choices: files.map((f) => ({
          name: f.name,
          value: f.path,
        })),
      });
    }
    const res = await fetch(
      `https://raw.githubusercontent.com/inbestigator/dressed-examples/main/${template}/.env.example`,
    );
    if (!res.ok) {
      throw new Error("Failed to fetch template.");
    }
    const parsed = parse(await res.text());
    const envVars: Record<string, string> = {};

    for (const [k, v] of Object.entries(parsed)) {
      envVars[k] = await input({ message: k, default: v });
    }

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
    exit(0);
  });

program.parse();
