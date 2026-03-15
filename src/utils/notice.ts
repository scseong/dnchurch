export function globalSearchFilter(row: any, _columnId: string, filterValue: string): boolean {
  const q = filterValue.trim().toLowerCase();
  if (!q) return true;

  return (
    row.original.title.toLowerCase().includes(q) || row.original.author.toLowerCase().includes(q)
  );
}
