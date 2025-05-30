import { join, relative } from "node:path";
import { build } from "esbuild";
import { readFileSync } from "node:fs";
import { env } from "node:process";

const pkgJson = JSON.parse(readFileSync("tsconfig.json", "utf8") ?? "{}");
const paths = Object.keys(pkgJson.compilerOptions.paths ?? {}).map(
  (p) => p.split("*")[0],
);

export default async function bundleFile(file: {
  path: string;
  outPath?: string;
}) {
  const root = env.DRESSED_ROOT ?? "src";
  if (!file.outPath) {
    file.outPath = join(
      ".dressed",
      relative(root, file.path).replace(/ts$/, "mjs"),
    );
  }

  await build({
    entryPoints: [file.path],
    outfile: file.outPath,
    bundle: true,
    minify: true,
    platform: "node",
    format: "esm",
    write: true,
    tsconfig: "tsconfig.json",
    treeShaking: true,
    plugins: [
      {
        name: "make-all-packages-external",
        setup: (build) => {
          const filter = /^[^./]|^\.[^./]|^\.\.[^/]/;
          build.onResolve({ filter }, (args) => {
            if (paths.some((p) => args.path.startsWith(p))) {
              return { external: false };
            }
            return { path: args.path, external: true };
          });
        },
      },
    ],
  });

  return file.outPath;
}
