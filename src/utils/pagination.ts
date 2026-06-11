/** 전체 페이지 수 — 0건이어도 최소 1페이지를 보장한다 */
export function getTotalPages(total: number, pageSize: number): number {
  if (pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(total / pageSize));
}
