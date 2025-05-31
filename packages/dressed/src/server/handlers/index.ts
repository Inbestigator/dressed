import ora from "ora";
import { stdout } from "node:process";
import type { BaseData } from "../../types/config.ts";
import { logRunnerError } from "../utils.ts";

interface SetupItemMessages<T, P> {
  noItem: string;
  pending: (data: BaseData<T>, props: P) => string;
}

export function createHandlerSetup<T, D, P extends unknown[] = [D]>(options: {
  itemMessages:
    | ((data: D) => SetupItemMessages<T, P>)
    | SetupItemMessages<T, P>;
  findItem: (data: D, items: BaseData<T>[]) => [BaseData<T>, P] | undefined;
}): (items: BaseData<T>[]) => (data: D) => Promise<void> {
  return (items) => async (data) => {
    const [item, props] = options.findItem(data, items) ?? [];
    let itemMessages = options.itemMessages;

    if (typeof itemMessages === "function") {
      itemMessages = itemMessages(data);
    }
    if (!item || !Array.isArray(props)) {
      ora(itemMessages.noItem).warn();
      return;
    }

    const loader = ora({
      stream: stdout,
      text: itemMessages.pending(item, props),
    }).start();

    try {
      await item.run?.(...props);
      loader.succeed();
    } catch (e) {
      logRunnerError(e, loader);
    }
  };
}
