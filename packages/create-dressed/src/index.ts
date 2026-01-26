#!/usr/bin/env node

import {
  cpSync,
  createWriteStream,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cwd, exit } from "node:process";
import { pipeline } from "node:stream/promises";
import { Command } from "commander";
import { parse } from "dotenv";
import Enquirer from "enquirer";
import { x } from "tar";

const program = new Command().name("create-dressed");

program
  .description("Clone a new bot from the examples repository")
  .argument("[name]", "Project name")
  .argument("[template]", "Template name")
  .action(async (name?: string, template?: string) => {
    const { prompt } = Enquirer;

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

    const tmp = mkdtempSync(join(tmpdir(), "create-dressed-"));
    const tarPath = join(tmp, "examples.tar.gz");

    mkdirSync(tmp, { recursive: true });

    const res = await fetch(`https://codeload.github.com/inbestigator/dressed-examples/tar.gz/refs/heads/main`);

    if (!res.body || !res.ok) throw new Error("Error fetching tarball");

    await pipeline(res.body, createWriteStream(tarPath));
    await x({ file: tarPath, cwd: tmp, strip: 1 });

    const nodeProjects = readdirSync(join(tmp, "node"), { withFileTypes: true })
      .filter((f) => f.isDirectory())
      .map((f) => f.name);
    const denoProjects = readdirSync(join(tmp, "deno"), { withFileTypes: true })
      .filter((f) => f.isDirectory())
      .map((f) => f.name);

    if (template && !template?.includes("/")) template = `node/${template}`;
    if (!template || !(template.startsWith("deno/") ? denoProjects : nodeProjects).includes(template.slice(5))) {
      template = `node/${
        (
          await prompt<{ template: string }>({
            name: "template",
            type: "select",
            message: "Select the template to use",
            choices: nodeProjects,
            required: true,
          }).catch(() => exit(1))
        ).template
      }`;
    }

    const templateDir = join(tmp, template);
    const envExamplePath = join(templateDir, ".env.example");
    const pkgPath = join(templateDir, "package.json");

    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      pkg.name = name;
      writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
    }
    if (existsSync(envExamplePath)) {
      const envExample = readFileSync(envExamplePath, "utf8");
      const envVars = await prompt(
        Object.entries(parse(envExample)).map(([k, v]) => ({
          type: /TOKEN|PASSWORD|KEY/.test(k) ? "password" : "text",
          name: k,
          message: k,
          initial: v,
        })),
      ).catch(() => exit(1));
      const envContent = Object.entries(envVars)
        .map(([k, v]) => `${k}="${v}"`)
        .join("\n");
      writeFileSync(join(templateDir, ".env"), envContent);
      unlinkSync(envExamplePath);
    }

    cpSync(templateDir, join(cwd(), name), { recursive: true });

    console.log("Project created successfully!");
    exit();
  });

program.parse();
