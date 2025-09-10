import { build } from "esbuild";
import { readFileSync } from "node:fs";

let tsconfig = { compilerOptions: { paths: {} } };
try {
  tsconfig = JSON.parse(readFileSync("tsconfig.json", "utf8"));
} catch {
  //pass
}
const paths = Object.keys(tsconfig.compilerOptions?.paths ?? {}).map(
  (p) => p.split("*")[0],
);

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
    plugins: [
      {
        name: "make-all-packages-external",
        setup(build) {
          build.onResolve({ filter: /^[^./]|^\.[^./]|^\.\.[^/]/ }, (args) => {
            if (paths.some((p) => args.path.startsWith(p))) {
              return { external: false };
            }
            return { external: true };
          });
        },
      },
    ],
  });
}
