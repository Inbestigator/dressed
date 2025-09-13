export type Promisable<T> = Promise<T> | T;
export type Requirable<R, T> = R extends true ? T : T | undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFn = (...args: any[]) => Promisable<unknown>;
