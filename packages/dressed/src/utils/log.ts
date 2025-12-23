import { serverConfig } from "./env.ts";

export const errorSymbol = "\u001B[31m✖\u001B[39m";
export const warnSymbol = "\u001B[33m⚠\u001B[39m";

const logger = {
  raw: {
    error: (...s: Parameters<typeof console.error>) => serverConfig.logger !== false && console.error(...s),
    info: (...s: Parameters<typeof console.info>) => serverConfig.logger === undefined && console.info(...s),
    log: (...s: Parameters<typeof console.log>) => serverConfig.logger === undefined && console.log(...s),
    warn: (...s: Parameters<typeof console.warn>) =>
      (serverConfig.logger === undefined || serverConfig.logger === "Warn") && console.warn(...s),
  },
  defer: (...s: Parameters<typeof console.info>) => logger.raw.info("\u001B[34m…\u001B[39m", ...s),
  error: (...s: Parameters<typeof console.error>) => logger.raw.error(errorSymbol, ...s),
  succeed: (...s: Parameters<typeof console.log>) => logger.raw.log("\u001B[32m✔\u001B[39m", ...s),
  warn: (...s: Parameters<typeof console.warn>) => logger.raw.warn(warnSymbol, ...s),
};

export default logger;
