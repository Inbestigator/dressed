// MIT License
// Copyright (c) 2025 Vercel, Inc.
// See the LICENSE file in the project root or https://github.com/vercel/next.js/blob/canary/license.md for full license information.

import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { type DotenvParseOutput, parse } from "dotenv";

export type Env = { [key: string]: string | undefined };
export type LoadedEnvFiles = Array<{
  path: string;
  contents: string;
  env: Env;
}>;

let initialEnv: Env;
let cachedLoadedEnvFiles: LoadedEnvFiles = [];

function replaceProcessEnv(sourceEnv: Env) {
  Object.keys(process.env).forEach((key) => {
    if (!key.startsWith("__NEXT_PRIVATE")) {
      if (sourceEnv[key] === undefined || sourceEnv[key] === "") {
        delete process.env[key];
      }
    }
  });

  Object.entries(sourceEnv).forEach(([key, value]) => {
    process.env[key] = value;
  });
}

function processEnv(loadedEnvFiles: LoadedEnvFiles) {
  if (!initialEnv) {
    initialEnv = Object.assign({}, process.env);
  }
  if (process.env.__NEXT_PROCESSED_ENV || loadedEnvFiles.length === 0) {
    return process.env as Env;
  }
  process.env.__NEXT_PROCESSED_ENV = "true";

  const origEnv = Object.assign({}, initialEnv);
  const parsed: DotenvParseOutput = {};

  for (const envFile of loadedEnvFiles) {
    try {
      const result = parse(envFile.contents);
      for (const key of Object.keys(result)) {
        if (typeof parsed[key] === "undefined" && typeof origEnv[key] === "undefined") {
          parsed[key] = result[key];
        }
      }
      envFile.env = result;
    } catch {}
  }
  return Object.assign(process.env, parsed);
}

export function loadEnvConfig() {
  if (!initialEnv) {
    initialEnv = Object.assign({}, process.env);
  }
  replaceProcessEnv(initialEnv);
  cachedLoadedEnvFiles = [];

  const isTest = process.env.NODE_ENV === "test";
  const mode = isTest ? "test" : process.env.NODE_ENV === "development" ? "development" : "production";
  const dotenvFiles = [`.env.${mode}.local`, mode !== "test" && `.env.local`, `.env.${mode}`, ".env"].filter(
    Boolean,
  ) as string[];

  for (const envFile of dotenvFiles) {
    const dotEnvPath = join(".", envFile);
    try {
      const stats = statSync(dotEnvPath);
      if (!stats.isFile() && !stats.isFIFO()) continue;

      const contents = readFileSync(dotEnvPath, "utf8");
      cachedLoadedEnvFiles.push({ path: envFile, contents, env: {} });
    } catch {}
  }
  processEnv(cachedLoadedEnvFiles);
}
