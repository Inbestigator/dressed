import type { BaseData, ServerConfig } from "../../types/config.ts";
import type { Promisable } from "../../types/utilities.ts";
import logger from "../../utils/log.ts";

interface SetupItemMessages<T, P> {
  noItem: string;
  middlewareKey: keyof NonNullable<ServerConfig["middleware"]>;
  pending: (data: T, props: P) => string;
}

export function createHandlerSetup<T extends BaseData<unknown>, D, P extends unknown[] = [D]>(options: {
  itemMessages: ((d: D) => SetupItemMessages<T, P>) | SetupItemMessages<T, P>;
  findItem: (d: D, i: T[]) => [T, P] | undefined;
}): (
  i: T[],
) => (d: D, m?: (...props: P) => Promisable<unknown[]>, k?: keyof NonNullable<T["exports"]>) => Promise<void> {
  return (items) =>
    async (data, middleware, key = "default") => {
      const [item, props] = options.findItem(data, items) ?? [];
      let itemMessages = options.itemMessages;

      if (typeof itemMessages === "function") {
        itemMessages = itemMessages(data);
      }
      if (!item || !Array.isArray(props)) {
        logger.warn(itemMessages.noItem);
        return;
      }

      const pendingText = itemMessages.pending(item, props);
      logger.defer(pendingText);

      try {
        const handler = item.exports[key as keyof typeof item.exports];
        if (!handler) throw new Error(`Unable to find '${String(key)}' in exports`);
        const args = middleware ? await middleware(...props) : props;
        await handler(...args);
      } catch (e) {
        const text = pendingText.replace("Running", "Failed to run");
        if (e instanceof Error) {
          logger.error(`${text} - ${e.message}`);
        } else {
          logger.error(text);
          logger.raw.error(e);
        }
      }
    };
}
