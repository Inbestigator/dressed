/** Deep merges two objects, producing a new object where values from `b` override those from `a`. */
export function override<T>(a: Partial<T>, b: Partial<T>): Partial<T> {
  const result = { ...a };

  for (const key in b) {
    const k = key as keyof T;
    const bv = b[k];
    const av = a[k];

    if (bv !== undefined && typeof bv === "object" && bv !== null && !Array.isArray(bv)) {
      result[k] = override(av ?? {}, bv) as T[typeof k];
    } else if (bv !== undefined) {
      result[k] = bv as T[typeof k];
    }
  }

  return result;
}
