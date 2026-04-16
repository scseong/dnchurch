export type SearchParams = Record<string, string | string[] | undefined>;
export type FilterPatch = Record<string, string | null | undefined>;

export const getString = (
  params: SearchParams,
  key: string,
): string | undefined => {
  const v = params[key];
  return Array.isArray(v) ? v[0] : v;
};

export const getInt = (
  params: SearchParams,
  key: string,
  opts?: { min?: number; max?: number },
): number | undefined => {
  const raw = getString(params, key);
  if (!raw) return undefined;
  const n = Number(raw);
  if (!Number.isInteger(n)) return undefined;
  if (opts?.min !== undefined && n < opts.min) return undefined;
  if (opts?.max !== undefined && n > opts.max) return undefined;
  return n;
};

export function buildFilterHref(
  basePath: string,
  params: SearchParams,
  keys: readonly string[],
  patch: FilterPatch = {},
): string {
  const next = new URLSearchParams();

  for (const key of keys) {
    const value = key in patch ? patch[key] : getString(params, key);
    if (value) next.set(key, value);
  }

  const qs = next.toString();
  return `${basePath}${qs ? `?${qs}` : ''}`;
}
