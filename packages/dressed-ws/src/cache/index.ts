import { defaultLogic } from "./default.ts";
import type { CachedFunctions, CacheLogic } from "./types.ts";

export function createCache<
  F extends CachedFunctions,
  D extends Partial<{
    [K in keyof F as Awaited<ReturnType<F[K]>> extends object
      ? Awaited<ReturnType<F[K]>> extends unknown[]
        ? never
        : K
      : never]: (keyof Awaited<ReturnType<F[K]>>)[];
  }>,
>(
  /** The functions to cache */
  functions: F,
  {
    desiredProps,
    logic = defaultLogic({}),
  }: {
    /** Only store the specified props for that function */
    desiredProps?: D;
    /** Functions for creating a custom cache implementation */
    logic?: CacheLogic<F>;
  } = {},
): {
  [K in keyof F]: K extends keyof D
    ? (
        ...a: Parameters<F[K]>
      ) => Promise<
        Pick<Awaited<ReturnType<F[K]>>, (D[K] extends [] ? D[K] : [])[number]> &
          Partial<Awaited<ReturnType<F[K]>>>
      >
    : F[K];
} {
  const revalidating = new Set<string>();
  function set(key: keyof F, cacheKey: string, value: unknown) {
    let storedValue = value;
    if (
      desiredProps &&
      key in desiredProps &&
      typeof value === "object" &&
      value !== null
    ) {
      storedValue = Object.fromEntries(
        Object.entries(value).filter(([k]) =>
          desiredProps[key as keyof typeof desiredProps]!.includes(k),
        ),
      );
    }
    logic.set(cacheKey, storedValue);
  }
  return Object.fromEntries(
    Object.entries(functions).map(([k, v]) => [
      k,
      async (...args: Parameters<F[string]>) => {
        const key = logic.resolveKey(k, args);
        const res = await logic.get(key);
        switch (res.state) {
          case "miss": {
            const value = await v(...args);
            set(k, key, value);
            return value;
          }
          case "stale": {
            if (!revalidating.has(key)) {
              revalidating.add(key);
              v(...args).then((v) => {
                set(k, key, v);
                revalidating.delete(key);
              });
            }
          }
          // eslint-disable-next-line no-fallthrough
          case "hit":
            return res.value;
        }
      },
    ]),
  ) as ReturnType<typeof createCache<F, D>>;
}

export * from "./default.ts";
export * from "./getters.ts";
