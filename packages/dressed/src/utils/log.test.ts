import { afterEach, beforeEach, expect, mock, spyOn, test } from "bun:test";
import { config } from "./env.ts";
import logger from "./log.ts";

beforeEach(() => {
  spyOn(console, "error");
  spyOn(console, "info");
  spyOn(console, "log");
  spyOn(console, "warn");
});
afterEach(() => mock.restore());

test("logs everything when config.logger === undefined", async () => {
  config.observability = { logger: undefined };

  logger.error(new Error("err"));
  logger.warn("warn");
  logger.succeed("ok");
  logger.defer("wait");

  expect(console.error).toHaveBeenCalledWith("\u001B[31m✖\u001B[39m", new Error("err"));
  expect(console.warn).toHaveBeenCalledWith("\u001B[33m⚠\u001B[39m", "warn");
  expect(console.log).toHaveBeenCalledWith("\u001B[32m✔\u001B[39m", "ok");
  expect(console.info).toHaveBeenCalledWith("\u001B[34m…\u001B[39m", "wait");
});

test("only allows warnings and errors when config.logger === 'Warn'", async () => {
  config.observability = { logger: "Warn" };

  logger.error(new Error("err"));
  logger.warn("warn");
  logger.succeed("ok");
  logger.defer("wait");

  expect(console.error).toHaveBeenCalledWith("\u001B[31m✖\u001B[39m", new Error("err"));
  expect(console.warn).toHaveBeenCalledWith("\u001B[33m⚠\u001B[39m", "warn");
  expect(console.log).not.toHaveBeenCalled();
  expect(console.info).not.toHaveBeenCalled();
});

test("only allows errors when config.logger === 'Error'", async () => {
  config.observability = { logger: "Error" };

  logger.error(new Error("err"));
  logger.warn("warn");
  logger.succeed("ok");
  logger.defer("wait");

  expect(console.error).toHaveBeenCalledWith("\u001B[31m✖\u001B[39m", new Error("err"));
  expect(console.warn).not.toHaveBeenCalled();
  expect(console.log).not.toHaveBeenCalled();
  expect(console.info).not.toHaveBeenCalled();
});

test("does not log anything when config.logger === false", async () => {
  config.observability = { logger: false };

  logger.error(new Error("err"));
  logger.warn("warn");
  logger.succeed("ok");
  logger.defer("wait");

  expect(console.error).not.toHaveBeenCalled();
  expect(console.warn).not.toHaveBeenCalled();
  expect(console.log).not.toHaveBeenCalled();
  expect(console.info).not.toHaveBeenCalled();
});

test("raw methods respect config flags directly", async () => {
  config.observability = { logger: undefined };

  logger.raw.error("e");
  logger.raw.warn("w");
  logger.raw.log("l");
  logger.raw.info("i");

  expect(console.error).toHaveBeenCalledWith("e");
  expect(console.warn).toHaveBeenCalledWith("w");
  expect(console.log).toHaveBeenCalledWith("l");
  expect(console.info).toHaveBeenCalledWith("i");
});

test("exposes correct symbols", async () => {
  expect(logger.symbols.error).toBe("\u001B[31m✖\u001B[39m");
  expect(logger.symbols.warn).toBe("\u001B[33m⚠\u001B[39m");
});
