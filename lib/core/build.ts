import { walk } from "@std/fs/walk";

export async function build(addInstance?: boolean) {
  const commandFiles = await Array.fromAsync(
    walk("./src/commands", {
      exts: [".ts"],
      includeDirs: false,
    }),
  );

  const componentFiles = await Array.fromAsync(
    walk("./src/components", {
      exts: [".ts"],
      includeDirs: false,
    }),
  );

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
