import { join, relative } from "node:path";
import { build } from "esbuild";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { env } from "node:process";

export default async function bundleFile(file: { path: string }) {
  const root = env.DRESSED_ROOT ?? "src";
  const outfile = join(
    ".dressed",
    relative(root, file.path).replace(/ts$/, "mjs"),
  );
  const pkgJson = JSON.parse(readFileSync("tsconfig.json", "utf8") ?? "{}");
  const paths = Object.keys(pkgJson.compilerOptions.paths ?? {}).map(
    (p) => p.split("*")[0],
  );

  await build({
    entryPoints: [file.path],
    outfile,
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

  file.path = pathToFileURL(outfile).href;
}
