import type { StatementFilters } from '@/modules/finance/domain/models/statement-filters';
import { applyFiltersToParams } from '@/modules/finance/domain/services/statement-filter-params';

export const STATEMENT_PDF_PATH = '/api/statement/pdf';

export function buildStatementPdfHref(month: string, filters: StatementFilters): string {
  const params = applyFiltersToParams(new URLSearchParams({ month }), filters);
  return `${STATEMENT_PDF_PATH}?${params.toString()}`;
}
