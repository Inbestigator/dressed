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
import { cwd } from "node:process";
import { pipeline } from "node:stream/promises";
import { cancel, intro, isCancel, outro, password, select, spinner, text } from "@clack/prompts";
import { parse } from "dotenv";
import sade from "sade";
import { x } from "tar";

const program = sade("create-dressed [name] [template]")
  .describe("Clone a new bot from the examples repository")
  .action(async (name?: string, template?: string) => {
    intro("Welcome to the Dressed project scaffolder");

    if (!name) {
      const value = await text({
        message: "Project name:",
        placeholder: "my-bot",
        validate: (value) => (!value?.length ? "Value is required!" : undefined),
      });
      if (isCancel(value)) {
        return cancel("Operation cancelled.");
      }
      name = value;
    }

    const tmp = mkdtempSync(join(tmpdir(), "create-dressed-"));
    const tarPath = join(tmp, "examples.tar.gz");

    mkdirSync(tmp, { recursive: true });

    const download = spinner();

    download.start("Downloading templates");

    const res = await fetch(`https://codeload.github.com/inbestigator/dressed-examples/tar.gz/refs/heads/main`);

    if (!res.body || !res.ok) throw new Error("Error fetching tarball");

    await pipeline(res.body, createWriteStream(tarPath));
    await x({ file: tarPath, cwd: tmp, strip: 1 });

    download.stop("Downloaded templates from GitHub");

    const nodeProjects = readdirSync(join(tmp, "node"), { withFileTypes: true })
      .filter((f) => f.isDirectory())
      .map((f) => f.name);
    const denoProjects = readdirSync(join(tmp, "deno"), { withFileTypes: true })
      .filter((f) => f.isDirectory())
      .map((f) => f.name);

    if (template && !template?.includes("/")) template = `node/${template}`;
    if (!template || !(template.startsWith("deno/") ? denoProjects : nodeProjects).includes(template.slice(5))) {
      const value = await select({
        message: "Select the template to use",
        options: nodeProjects.map((p) => ({ label: p, value: `node/${p}` })),
      });
      if (isCancel(value)) {
        return cancel("Operation cancelled.");
      }
      template = value;
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
      const envVars = [];
      for (const [k, v] of Object.entries(parse(envExample))) {
        const value = await (/TOKEN|PASSWORD|KEY/.test(k) ? password : text)({ message: k, initialValue: v });
        if (isCancel(value)) {
          return cancel("Operation cancelled.");
        }
        envVars.push([k, value]);
      }
      const envContent = envVars.map(([k, v]) => `${k}="${v}"`).join("\n");
      writeFileSync(join(templateDir, ".env"), envContent);
      unlinkSync(envExamplePath);
    }

    cpSync(templateDir, join(cwd(), name), { recursive: true });

    outro("Project created successfully!");
  });

program.parse(process.argv);
