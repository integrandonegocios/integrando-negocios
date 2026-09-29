export const PAGE_SIZE = 24;
export function pageNumber(value: unknown): number {
  if (typeof value !== "string" || !/^[1-9]\d{0,5}$/.test(value)) return 1;
  return Math.min(Number(value), 10000);
}
