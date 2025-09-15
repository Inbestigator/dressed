export type Promisable<T> = Promise<T> | T;
export type Requirable<R, T> = R extends true ? T : T | undefined;
// biome-ignore lint/suspicious/noExplicitAny: The function is any
export type AnyFn = (...args: any[]) => Promisable<unknown>;
