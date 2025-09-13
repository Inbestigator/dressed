import { build } from "esbuild";

export default async function bundleFiles(
  entryPoints: { in: string; out: string }[],
) {
  await build({
    entryPoints,
    outdir: ".dressed",
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
