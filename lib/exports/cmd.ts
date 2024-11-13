import loader from "../internal/loader.ts";
import { Command } from "commander";
import { build } from "./mod.ts";
import { writeFileSync } from "node:fs";

const program = new Command();

program.name("discord-http").description("An HTTP Discord bot framework.");

program
  .command("build")
  .description("Builds the bot imports.")
  .option("-i, --instance", "Include an instance create in the generated file")
  .option("-r, --register", "Register slash commands")
  .action(async ({ instance, register }) => {
    const outputContent = await build(instance, register);
    writeFileSync("./bot.gen.ts", new TextEncoder().encode(outputContent));
    loader("Wrote to bot.gen.ts").resolve();
  });

program.parse();
