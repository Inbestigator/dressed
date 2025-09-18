export default async function bundleFiles(entry: string, outdir: string) {
  try {
    const { build } = await import("bun");
    return build({
      entrypoints: [entry],
      outdir,
      naming: "[dir]/[name].mjs",
      minify: true,
      target: "bun",
      packages: "external",
    });
  } catch {
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
      throw new Error("You must install esbuild to be able to bundles files outside of a Bun environment");
    }
  }
}
