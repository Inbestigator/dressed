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
  } catch {
    throw new Error(
      "Dressed requires Esbuild to bundle files, but it is not installed. Please install 'esbuild' and try again.",
    );
  }
}
