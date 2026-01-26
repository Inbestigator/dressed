import { config } from "./env.ts";

const logger = {
  symbols: { error: "\u001B[31m✖\u001B[39m", warn: "\u001B[33m⚠\u001B[39m" },
  raw: {
    error: (...s: Parameters<typeof console.error>) => config.logger !== false && console.error(...s),
    info: (...s: Parameters<typeof console.info>) => config.logger === undefined && console.info(...s),
    log: (...s: Parameters<typeof console.log>) => config.logger === undefined && console.log(...s),
    warn: (...s: Parameters<typeof console.warn>) =>
      (config.logger === undefined || config.logger === "Warn") && console.warn(...s),
  },
  defer: (...s: Parameters<typeof console.info>) => logger.raw.info("\u001B[34m…\u001B[39m", ...s),
  error: (...s: Parameters<typeof console.error>) => logger.raw.error(logger.symbols.error, ...s),
  succeed: (...s: Parameters<typeof console.log>) => logger.raw.log("\u001B[32m✔\u001B[39m", ...s),
  warn: (...s: Parameters<typeof console.warn>) => logger.raw.warn(logger.symbols.warn, ...s),
};

export default logger;
