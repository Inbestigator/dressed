import { config } from "./env.ts";

type LogFn = typeof console.log;
type Logger = {
  symbols: { error: string; warn: string };
  raw: Record<"error" | "info" | "log" | "warn", LogFn>;
} & Record<"defer" | "succeed" | "warn", LogFn> & { error: (e: Error, ...p: Parameters<LogFn>) => ReturnType<LogFn> };

const logger: Logger = {
  symbols: { error: "\u001B[31m✖\u001B[39m", warn: "\u001B[33m⚠\u001B[39m" },
  raw: {
    error: (...s: Parameters<typeof console.error>) => config.logger !== false && console.error(...s),
    info: (...s: Parameters<typeof console.info>) => config.logger === undefined && console.info(...s),
    log: (...s: Parameters<typeof console.log>) => config.logger === undefined && console.log(...s),
    warn: (...s: Parameters<typeof console.warn>) =>
      (config.logger === undefined || config.logger === "Warn") && console.warn(...s),
  },
  defer: (...s: Parameters<typeof console.info>) => logger.raw.info("\u001B[34m…\u001B[39m", ...s),
  error(e: Error, ...s: Parameters<typeof console.error>) {
    config.hooks?.onError?.(e);
    return logger.raw.error(logger.symbols.error, e, ...s);
  },
  succeed: (...s: Parameters<typeof console.log>) => logger.raw.log("\u001B[32m✔\u001B[39m", ...s),
  warn: (...s: Parameters<typeof console.warn>) => logger.raw.warn(logger.symbols.warn, ...s),
};

export default logger;
