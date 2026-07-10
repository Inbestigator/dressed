import type { BaseData } from "../../types/config.ts";
import type { Promisable } from "../../types/utilities.ts";
import logger from "../../utils/log.ts";

interface SetupItemMessages<T, P> {
  noItem: string;
  pending: (data: T, props: P) => string;
}

type FunctionKeys<T> = Required<{ [K in keyof T]: NonNullable<T[K]> extends CallableFunction ? K : never }>[keyof T];

export function createHandlerSetup<
  ParsedData extends BaseData<CallableFunction>,
  Data,
  Props extends unknown[] = [Data],
  T extends Record<string, unknown> = Record<string, ParsedData>,
>(options: {
  itemMessages: ((d: Data) => SetupItemMessages<ParsedData, Props>) | SetupItemMessages<ParsedData, Props>;
  findItem: (
    d: Data,
    i: T,
    k: FunctionKeys<ParsedData>,
  ) => [ParsedData, Extract<ParsedData[keyof ParsedData], CallableFunction>, Props] | undefined;
  cleanup?: (d: Data, v: unknown) => unknown;
}): (
  i: T,
) => (
  d: Data,
  h: { unknown?: (data: Data) => unknown; before?: (...p: Props) => Promisable<unknown[] | undefined> },
  k: FunctionKeys<ParsedData>,
) => Promise<void> {
  return (items) => async (data, hooks, key) => {
    const [item, handler, props] = options.findItem(data, items, key) ?? [];
    let itemMessages = options.itemMessages;

    if (typeof itemMessages === "function") {
      itemMessages = itemMessages(data);
    }
    if (!item || !Array.isArray(props)) {
      if (hooks.unknown) await hooks.unknown(data);
      else logger.warn(itemMessages.noItem);
      return;
    }

    const pendingText = itemMessages.pending(item, props);
    logger.defer(pendingText);

    try {
      if (!handler) throw new Error(`Unable to find '${String(key)}' in exports`);
      const res = await handler(...((await hooks.before?.(...props)) ?? props));
      await options.cleanup?.(data, res);
    } catch (e) {
      const text = pendingText.replace("Running", "Failed to run");
      if (e instanceof Error) {
        logger.error(new Error(`${text} - ${e.message}`, { cause: e }));
      } else {
        logger.error(new Error(text, { cause: e }));
      }
    }
  };
}
