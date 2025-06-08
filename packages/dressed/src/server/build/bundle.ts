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

export default async function bundleFile(file: {
  name: string;
  path: string;
  outPath: string;
}) {
  await build({
    entryPoints: [file.path],
    outfile: file.outPath,
    bundle: true,
    minify: true,
    platform: "node",
    format: "esm",
    write: true,
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
            return { external: true };
          });
        },
      },
    ],
  });

  return file.outPath;
}
