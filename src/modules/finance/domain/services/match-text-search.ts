type SearchableEntry = { description: string; category: string; account: string };

export function matchesTextSearch(entry: SearchableEntry, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [entry.description, entry.category, entry.account].some((field) => field.toLowerCase().includes(needle));
}
