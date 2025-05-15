#!/usr/bin/env node

import ora from "ora";
import { Command } from "commander";
import {
  build,
  type CommandData,
  type ComponentData,
  type EventData,
} from "../server/index.ts";
import { dirname, join } from "node:path";
import { cwd, exit, stdout } from "node:process";
import inquirer from "inquirer";
import { parse } from "dotenv";
import { mkdirSync, writeFileSync } from "fs";

const program = new Command();

program
  .name("dressed")
  .description("A sleek, serverless-ready Discord bot framework.");

program
  .command("build")
  .description("Builds the bot and writes to a bot.gen.ts")
  .option("-i, --instance", "Include an instance create in the generated file")
  .option("-r, --register", "Register slash commands")
  .option(
    "-e, --endpoint <endpoint>",
    "The endpoint to listen on, defaults to `/`",
  )
  .option("-p, --port <port>", "The port to listen on, defaults to `8000`")
  .option("-R, --root <root>", "Source root for the bot, defaults to `src`")
  .option("-D, --dest <dest>", "Output file, defaults to `bot.gen.ts`")
  .action(async ({ instance, register, endpoint, port, root, dest }) => {
    if (port && isNaN(Number(port))) {
      ora("Port must be a valid number").fail();
      exit();
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

${exportDataArray("commands", commands)}
${exportDataArray("components", components)}
${exportDataArray("events", events)}
export const config = ${JSON.stringify(config)};
${register ? `\ninstallCommands(commands);\n` : ""}
${instance ? generateInstanceCreation() : ""}
    `.trim();

    buildLoader.succeed("Assembled generated build");
    const writing = ora("Writing to bot.gen.ts");
    writeFileSync(dest ?? "bot.gen.ts", outputContent);
    writing.succeed("Wrote to bot.gen.ts");
    exit();
  });

function exportDataArray(
  variableName: "commands" | "components" | "events",
  content: (CommandData | ComponentData | EventData)[],
): string {
  let importString = "";
  switch (variableName) {
    case "commands":
      importString =
        '"config":async ()=>(await import("./$1")).config,"do":async (i)=>(await import("./$1")).default(i)';
      break;
    case "components":
      importString = '"do":async (i,a)=>(await import("./$1")).default(i,a)';
      break;
    case "events":
      importString = '"do":async (e)=>(await import("./$1")).default(e)';
  }
  return `export const ${variableName} = ${JSON.stringify(content.map((c) => ({ ...c, import: c.path }))).replace(/"import":"(.+)"/g, importString)};`;
}

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
      ({ name } = await inquirer.prompt([
        {
          message: "Project name:",
          type: "input",
          name: "name",
          required: true,
        },
      ]));
    }
    if (
      !template ||
      (!template.startsWith("node/") && !template.startsWith("deno/"))
    ) {
      const { isDeno } = await inquirer.prompt([
        {
          message: "Would you like to use a Deno specific template?",
          type: "confirm",
          default: false,
          name: "isDeno",
        },
      ]);
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
      ({ template } = await inquirer.prompt([
        {
          message: "Select the template to use",
          type: "select",
          name: "template",
          choices: files.map((f) => ({
            name: f.name,
            value: f.path,
          })),
        },
      ]));
    }
    const res = await fetch(
      `https://raw.githubusercontent.com/inbestigator/dressed-examples/main/${template}/.env.example`,
    );
    if (!res.ok) {
      throw new Error("Failed to fetch template.");
    }
    const parsed = parse(await res.text());
    const envVars = await inquirer.prompt(
      Object.entries(parsed).map(([k, v]) => ({
        message: k,
        name: k,
        type: "input",
        default: v,
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
      exit(1);
    }
    mkdirLoader.succeed();

    console.log("\x1b[32m%s", "Project created successfully.");
    exit();
  });

program.parse();
