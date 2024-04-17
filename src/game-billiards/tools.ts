export function choose<T>(...variants: T[]) {
  return variants[Math.floor(Math.random() * variants.length)];
}
