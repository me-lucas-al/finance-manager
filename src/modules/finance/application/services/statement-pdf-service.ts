import { formatSaoPauloDateTime } from '@/lib/format-date-time';
import type { StatementFilters } from '../../domain/models/statement-filters';
import type { StatementRenderer } from '../../domain/ports/statement-renderer';
import { selectStatementEntries } from '../../domain/services/select-statement-entries';
import { buildStatementDocument } from '../../domain/services/statement-pdf-rows';
import { balanceThrough } from '../../domain/services/summarize-ledger';
import type { LedgerLoader } from './data-loaders';

export type StatementRequest = {
  userId: string;
  userLabel: string;
  month: string;
  filters: StatementFilters;
};

export class StatementPdfService {
  constructor(
    private readonly loadLedger: LedgerLoader,
    private readonly renderer: StatementRenderer,
    private readonly now: () => Date
  ) {}

  async generate(request: StatementRequest): Promise<Uint8Array> {
    const allEntries = await this.loadLedger(request.userId);
    const document = buildStatementDocument({
      entries: selectStatementEntries(allEntries, request.month, request.filters),
      month: request.month,
      filters: request.filters,
      accumulatedBalance: balanceThrough(allEntries, request.month),
      userLabel: request.userLabel,
      generatedAt: formatSaoPauloDateTime(this.now()),
    });
    return this.renderer.render(document);
  }
}
