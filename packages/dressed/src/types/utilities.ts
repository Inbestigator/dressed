export type Promisable<T> = Promise<T> | T;
export type Requirable<R, T> = R extends true ? T : T | undefined;
