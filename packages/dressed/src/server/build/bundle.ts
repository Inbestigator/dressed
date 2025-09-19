export default async function bundleFiles(entry: string, outdir: string) {
  if (process.versions.bun) {
    const { build } = await import("bun");
    return build({
      entrypoints: [entry],
      outdir,
      naming: "[dir]/[name].mjs",
      minify: true,
      target: "bun",
      packages: "external",
    });
  }
  try {
    // @ts-expect-error Esbuild is an optional peer dep
    const { build } = await import("esbuild");
    return build({
      entryPoints: [entry],
      outdir,
      outExtension: { ".js": ".mjs" },
      bundle: true,
      minify: true,
      splitting: true,
      platform: "node",
      format: "esm",
      write: true,
      treeShaking: true,
      jsx: "automatic",
      logLevel: "error",
      packages: "external",
    });
  } catch (e) {
    const { code, message } = e as { code: string; message: string };
    if (code === "ERR_MODULE_NOT_FOUND" && message.includes("'esbuild'")) {
      throw new Error(
        "Dressed requires Esbuild to bundle files, but it is not installed. Please install 'esbuild' and try again.",
      );
    } else throw e;
  }
}
