import { defaultLogic } from "./default-logic.ts";
import type { CachedFunctions, CacheLogic } from "./types.ts";

type DesiredProps<F extends CachedFunctions> = Partial<{
  [K in keyof F as Awaited<ReturnType<F[K]>> extends object
    ? Awaited<ReturnType<F[K]>> extends string[]
      ? never
      : K
    : never]: (keyof Awaited<ReturnType<F[K]>>)[];
}>;

export type Cache<
  F extends CachedFunctions,
  D extends DesiredProps<F> = object,
  L extends CacheLogic<F> = CacheLogic<F>,
> = {
  [K in keyof F]: (K extends keyof D
    ? (
        ...a: Parameters<F[K]>
      ) => Promise<
        Pick<
          Awaited<ReturnType<F[K]>>,
          (D[K] extends string[] ? D[K] : [])[number]
        > &
          Partial<Awaited<ReturnType<F[K]>>>
      >
    : F[K]) & {
    /** Delete the cached value corresponding to the parameters */
    clear: (...a: Parameters<F[K]>) => ReturnType<L["delete"]>;
  };
};

export function createCache<
  F extends CachedFunctions,
  D extends DesiredProps<F>,
  L extends CacheLogic<F>,
>(
  /** The functions to cache */
  functions: F,
  {
    desiredProps,
    logic = defaultLogic() as unknown as L,
  }: {
    /** Only store the specified props for that function */
    desiredProps?: D;
    /** Functions for creating a custom cache implementation */
    logic?: L;
  } = {},
): Cache<F, D> {
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
    revalidating.delete(cacheKey);
  }
  return Object.fromEntries(
    Object.entries(functions).map(([k, v]) => [
      k,
      Object.assign(
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
                });
              }
            }
            // eslint-disable-next-line no-fallthrough
            case "hit":
              return res.value;
          }
        },
        {
          clear(...a: Parameters<F[string]>) {
            return logic.delete(logic.resolveKey(k, a));
          },
        },
      ),
    ]),
  ) as Cache<F, D>;
}

export * from "./default-logic.ts";
export * as getters from "./getters.ts";
