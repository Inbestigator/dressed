import loader from "../internal/loader.ts";
import { Command } from "commander";
import { createInstance } from "../core/instance.ts";
import { build } from "./mod.ts";
import { writeFileSync } from "node:fs";
import { env } from "node:process";

const program = new Command();

program.name("discord-http").description("An HTTP Discord bot framework.");

program
  .command("start")
  .description("Starts the bot.")
  .option("-r, --register", "Register slash commands")
  .action(async ({ register }) => {
    if (register) {
      env.REGISTER_COMMANDS = "true";
    }
    await createInstance();
  });

program
  .command("build")
  .description("Builds the bot imports.")
  .option("-i, --instance", "Include an instance create in the generated file")
  .action(async ({ instance }) => {
    const outputContent = await build(instance);
    writeFileSync("./bot.gen.ts", new TextEncoder().encode(outputContent));
    loader("Wrote to bot.gen.ts").resolve();
  });

program.parse();
