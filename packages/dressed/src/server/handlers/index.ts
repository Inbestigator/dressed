import { stdout } from "node:process";
import spinner from "yocto-spinner";
import type { BaseData, ServerConfig } from "../../types/config.ts";
import type { Promisable } from "../../types/utilities.ts";

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
        spinner().warning(itemMessages.noItem);
        return;
      }

      const loader = spinner({ stream: stdout }).start(itemMessages.pending(item, props));

      try {
        let handler: T["run"] | undefined;
        if (key && item.exports) {
          handler = item.exports[key as keyof typeof item.exports];
          if (!handler) {
            throw new Error(`Unable to find '${String(key)}' in exports`);
          }
        } else {
          handler = item.run;
        }
        if (!handler) throw new Error("Unable to find a handler to execute");
        const args = middleware ? await middleware(...props) : props;
        await handler(...args);
        loader.success();
      } catch (e) {
        const text = loader.text.replace("Running", "Failed to run");
        if (e instanceof Error) {
          loader.error(`${text} - ${e.message}`);
        } else {
          loader.error(text);
          console.error(e);
        }
      }
    };
}
