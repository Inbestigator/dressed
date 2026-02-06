import { afterEach, beforeEach, expect, type Mock, mock, test } from "bun:test";
import { parse } from "dotenv";
import { loadEnvConfig } from "./dotenv.ts";

let statSyncMock: Mock<(p: string) => { isFile: () => boolean; isFIFO: () => boolean }>;
let readFileSyncMock: Mock<(p: string) => string>;
let parseMock: Mock<typeof parse>;

beforeEach(() => {
  process.env = {};
  statSyncMock = mock();
  readFileSyncMock = mock();
  parseMock = mock(parse);

  mock.module("node:fs", () => ({ statSync: statSyncMock, readFileSync: readFileSyncMock }));
  mock.module("dotenv", () => ({ parse: parseMock }));
});
afterEach(() => mock.restore());

test("loads env files in development mode and applies precedence rules", async () => {
  process.env.NODE_ENV = "development";
  process.env.EXISTING = "from-process";

  statSyncMock.mockImplementation(() => ({ isFile: () => true, isFIFO: () => false }));

  readFileSyncMock.mockImplementation((path) => {
    if (path.includes(".env.development.local")) return "A=1\nB=1";
    if (path.includes(".env.local")) return "B=2\nC=2";
    if (path.includes(".env.development")) return "C=3\nD=3";
    return "D=4\nE=4";
  });

  loadEnvConfig();

  expect(process.env.A).toBe("1");
  expect(process.env.B).toBe("1");
  expect(process.env.C).toBe("2");
  expect(process.env.D).toBe("3");
  expect(process.env.E).toBe("4");

  expect(process.env.EXISTING).toBe("from-process");
  expect(process.env.__PROCESSED_ENV).toBe("true");
});

test("short-circuits when __PROCESSED_ENV is already set", async () => {
  process.env.NODE_ENV = "development";
  process.env.__PROCESSED_ENV = "true";

  loadEnvConfig();

  expect(statSyncMock).not.toHaveBeenCalled();
  expect(readFileSyncMock).not.toHaveBeenCalled();
});

test("returns early when no env files are found", async () => {
  process.env.NODE_ENV = "production";

  statSyncMock.mockImplementation(() => {
    throw new Error("missing");
  });

  loadEnvConfig();

  expect(process.env.__PROCESSED_ENV).toBeUndefined();
});

test("skips paths that are not files or FIFOs", async () => {
  process.env.NODE_ENV = "production";

  statSyncMock.mockImplementation(() => ({ isFile: () => false, isFIFO: () => false }));

  loadEnvConfig();

  expect(readFileSyncMock).not.toHaveBeenCalled();
});

test("handles dotenv parse errors gracefully", async () => {
  process.env.NODE_ENV = "test";

  statSyncMock.mockImplementation(() => ({ isFile: () => true, isFIFO: () => false }));

  readFileSyncMock.mockReturnValue("INVALID");

  parseMock.mockImplementation(() => {
    throw new Error("parse failure");
  });

  loadEnvConfig();

  expect(process.env.__PROCESSED_ENV).toBe("true");
});

test("uses correct file order in test mode", async () => {
  process.env.NODE_ENV = "test";

  const seen: string[] = [];

  statSyncMock.mockImplementation((path: string) => {
    seen.push(path);
    return { isFile: () => true, isFIFO: () => false };
  });

  readFileSyncMock.mockReturnValue("X=1");

  loadEnvConfig();

  expect(seen).toEqual([".env.test.local", ".env.test", ".env"]);
});
