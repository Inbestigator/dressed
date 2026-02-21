import { config } from "./env.ts";

const logger = {
  symbols: { error: "\u001B[31m✖\u001B[39m", warn: "\u001B[33m⚠\u001B[39m" },
  raw: {
    error: (...s: Parameters<typeof console.error>) => config.observability?.logger !== false && console.error(...s),
    info: (...s: Parameters<typeof console.info>) => config.observability?.logger === undefined && console.info(...s),
    log: (...s: Parameters<typeof console.log>) => config.observability?.logger === undefined && console.log(...s),
    warn: (...s: Parameters<typeof console.warn>) =>
      (config.observability?.logger === undefined || config.observability?.logger === "Warn") && console.warn(...s),
  },
  defer: (...s: Parameters<typeof console.info>) => logger.raw.info("\u001B[34m…\u001B[39m", ...s),
  error(e: Error, ...s: Parameters<typeof console.error>) {
    config.observability?.onError?.(e);
    logger.raw.error(logger.symbols.error, e, ...s);
  },
  succeed: (...s: Parameters<typeof console.log>) => logger.raw.log("\u001B[32m✔\u001B[39m", ...s),
  warn: (...s: Parameters<typeof console.warn>) => logger.raw.warn(logger.symbols.warn, ...s),
};

export default logger;
