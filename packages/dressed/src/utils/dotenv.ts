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

const initialEnv: Env = { ...process.env };

function processEnv(loadedEnvFiles: LoadedEnvFiles) {
  if (process.env.__PROCESSED_ENV || loadedEnvFiles.length === 0) {
    return process.env as Env;
  }
  process.env.__PROCESSED_ENV = "true";

  const parsed: DotenvParseOutput = {};

  for (const envFile of loadedEnvFiles) {
    try {
      const result = parse(envFile.contents);
      for (const key of Object.keys(result)) {
        if (parsed[key] === undefined && initialEnv[key] === undefined) {
          parsed[key] = result[key];
        }
      }
      envFile.env = result;
    } catch {}
  }
  Object.assign(process.env, parsed);
}

export function loadEnvConfig() {
  if (process.env.__PROCESSED_ENV) return;
  const isTest = process.env.NODE_ENV === "test";
  const isDev = process.env.NODE_ENV === "development";
  const mode = isTest ? "test" : isDev ? "development" : "production"; // NOSONAR
  const dotenvFiles = [`.env.${mode}.local`, !isTest && `.env.local`, `.env.${mode}`, ".env"].filter(
    Boolean,
  ) as string[];
  const files = [];

  for (const envFile of dotenvFiles) {
    const dotEnvPath = join(".", envFile);
    try {
      const stats = statSync(dotEnvPath);
      if (!stats.isFile() && !stats.isFIFO()) continue;
      const contents = readFileSync(dotEnvPath, "utf8");
      files.push({ path: envFile, contents, env: {} });
    } catch {}
  }

  processEnv(files);
}
