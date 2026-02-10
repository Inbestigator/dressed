export type Promisable<T> = Promise<T> | T;
export type Requirable<R, T, D = undefined> = R extends true ? T : T | D;
