const CATEGORY_COLORS: Record<string, string> = {
  'alimentação': '#3b82f6',
  'transporte': '#10b981',
  'moradia': '#f59e0b',
  'saúde': '#ef4444',
  'lazer': '#8b5cf6',
  'educação': '#06b6d4',
  'compras': '#ec4899',
  'mercado': '#14b8a6',
  'outros': '#6b7280',
};

export function getCategoryColor(category: string): string {
  const normalized = category.toLowerCase().trim();
  return CATEGORY_COLORS[normalized] ?? '#6366f1';
}
