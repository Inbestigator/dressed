#!/usr/bin/env node

import ora from "ora";
import { Command } from "commander";
import { dirname, join } from "node:path";
import { cwd, exit, stdout } from "node:process";
import { select, input, confirm } from "@inquirer/prompts";
import { parse } from "dotenv";
import { mkdirSync, writeFileSync } from "fs";
import build from "../server/build/build.ts";
import { writeFile } from "node:fs/promises";

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
  .action(async ({ instance, register, endpoint, port, root }) => {
    if (port && isNaN(Number(port))) {
      ora("Port must be a valid number").fail();
      return;
    }
    port = port ? Number(port) : undefined;
    const { commands, components, events, config } = await build({
      endpoint,
      port,
      root,
    });
    const buildLoader = ora({
      stream: stdout,
      text: "Assembling generated build",
    }).start();

    const outputContent = `
${generateImports(instance, register)}
import commandList from "./commands.json" with { type: "json" }
import componentList from "./components.json" with { type: "json" }
import eventList from "./events.json" with { type: "json" }

${[...commands, ...components, ...events]
  .map((v) => `import h${v.uid} from "${v.path}"`)
  .join("\n")}

const handlers = { ${[...commands, ...components, ...events].map((v) => `h${v.uid}`).join(", ")} }

const config = ${JSON.stringify(config)};

const commands = commandList.map(c=>({...c,run:handlers[\`h\${c.uid}\`]}));
const components = componentList.map(c=>({...c,run:handlers[\`h\${c.uid}\`]}));
const events = eventList.map(e=>({...e,run:handlers[\`h\${c.uid}\`]}));

export { commands, components, events, config }
${register ? `\ninstallCommands(commands);\n` : ""}
${instance ? generateInstanceCreation() : ""}`.trim();
    const typeContent = `
import type { CommandData, ComponentData, EventData, ServerConfig } from "dressed/server";

export declare const commands: CommandData[];
export declare const components: ComponentData[];
export declare const events: EventData[];
export declare const config: ServerConfig;`;

    await Promise.all([
      writeFile(".dressed/index.mjs", outputContent),
      writeFile(".dressed/index.d.ts", typeContent),
      writeFile(".dressed/commands.json", JSON.stringify(commands)),
      writeFile(".dressed/components.json", JSON.stringify(components)),
      writeFile(".dressed/events.json", JSON.stringify(events)),
    ]);

    buildLoader.succeed("Assembled generated build");
    exit(0);
  });

const generateImports = (addInstance?: boolean, registerCommands?: boolean) =>
  addInstance || registerCommands
    ? `import { ${
        addInstance
          ? `createServer${
              registerCommands ? ", installCommands" : ""
            }, setupCommands, setupComponents, setupEvents`
          : registerCommands
            ? "installCommands"
            : ""
      } } from "dressed/server";`
    : "";

function generateInstanceCreation(): string {
  return `createServer(setupCommands(commands), setupComponents(components), setupEvents(events), config);
  `.trim();
}

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
