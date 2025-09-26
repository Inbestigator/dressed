export const logDefer = (...s: unknown[]) => console.info("\u001B[34m…\u001B[39m", ...s);
export const logError = (...s: unknown[]) => console.error("\u001B[31m✖\u001B[39m", ...s);
export const logWarn = (...s: unknown[]) => console.warn("\u001B[33m⚠\u001B[39m", ...s);
export const logSuccess = (...s: unknown[]) => console.log("\u001B[32m✔\u001B[39m", ...s);
