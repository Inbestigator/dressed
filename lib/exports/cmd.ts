import ora from "ora";
import { Command } from "commander";
import { build } from "./mod.ts";
import { writeFile } from "node:fs/promises";

const program = new Command();

program.name("discord-http").description("An HTTP Discord bot framework.");

program
  .command("build")
  .description("Builds the bot imports.")
  .option("-i, --instance", "Include an instance create in the generated file")
  .option("-r, --register", "Register slash commands")
  .action(async ({ instance, register }) => {
    const outputContent = await build(instance, register);
    const writing = ora("Writing to bot.gen.ts");
    await writeFile("./bot.gen.ts", new TextEncoder().encode(outputContent));
    writing.succeed("Wrote to bot.gen.ts");
    Deno.exit();
  });

program.parse();
