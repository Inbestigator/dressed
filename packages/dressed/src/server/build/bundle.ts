import { build } from "esbuild";

export default async function bundleFiles(entry: string, outdir: string) {
  await build({
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
}
