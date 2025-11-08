export const errorSymbol = "\u001B[31m✖\u001B[39m";
export const warnSymbol = "\u001B[33m⚠\u001B[39m";
export const logDefer = (...s: Parameters<typeof console.info>) => console.info("\u001B[34m…\u001B[39m", ...s);
export const logError = (...s: Parameters<typeof console.error>) => console.error(errorSymbol, ...s);
export const logWarn = (...s: Parameters<typeof console.warn>) => console.warn(warnSymbol, ...s);
export const logSuccess = (...s: Parameters<typeof console.log>) => console.log("\u001B[32m✔\u001B[39m", ...s);
