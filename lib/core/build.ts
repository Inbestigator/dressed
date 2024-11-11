import { walk } from "@std/fs/walk";
import { yellow } from "@std/fmt/colors";

export async function build(addInstance?: boolean) {
  const commandFiles = await fetchCommands();

  const componentFiles = await fetchComponents();

  const files = commandFiles.concat(componentFiles);
  files.push({
    name: "bot.config.ts",
    path: "bot.config.ts",
    isDirectory: false,
    isFile: true,
    isSymlink: false,
  });

  Deno.writeFileSync(
    "./bot.gen.ts",
    new TextEncoder().encode(
      `${
        files
          .map((f) => `import "./${f.path.replaceAll("\\", "/")}";`)
          .join("\n")
      }${
        addInstance
          ? '\nimport { createInstance } from "@inbestigator/discord-http";\n\nDeno.env.set("REGISTER_COMMANDS", "true");\n\nawait createInstance();\n'
          : ""
      }`,
    ),
  );
}

async function fetchCommands() {
  try {
    Deno.readDirSync("./src/commands");
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      console.warn(` ${yellow("!")} src/commands directory not found`);
    }
    return [];
  }

  return await Array.fromAsync(
    walk("./src/commands", {
      exts: [".ts"],
      includeDirs: false,
    }),
  );
}

async function fetchComponents() {
  try {
    Deno.readDirSync("./src/components");
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      console.warn(` ${yellow("!")} src/components directory not found`);
    }
    return [];
  }

  return await Array.fromAsync(
    walk("./src/components", {
      exts: [".ts"],
      includeDirs: false,
    }),
  );
}
