import { formatSaoPauloDateTime } from '@/lib/format-date-time';
import type { StatementFilters } from '../../domain/models/statement-filters';
import type { StatementRenderer } from '../../domain/ports/statement-renderer';
import { selectStatementEntries } from '../../domain/services/select-statement-entries';
import { buildStatementDocument } from '../../domain/services/statement-pdf-rows';
import { balanceThroughDate } from '../../domain/services/summarize-ledger';
import type { LedgerLoader } from './data-loaders';
import type { StatementPeriodResolver } from './statement-period-resolver';

export type StatementRequest = {
  userId: string;
  userLabel: string;
  month: string;
  filters: StatementFilters;
};

export class StatementPdfService {
  constructor(
    private readonly loadLedger: LedgerLoader,
    private readonly resolvePeriod: StatementPeriodResolver,
    private readonly renderer: StatementRenderer,
    private readonly now: () => Date
  ) {}

  async generate(request: StatementRequest): Promise<Uint8Array> {
    const [allEntries, period] = await Promise.all([
      this.loadLedger(request.userId),
      this.resolvePeriod(request.userId, request.month),
    ]);
    const document = buildStatementDocument({
      entries: selectStatementEntries(allEntries, period.range, request.filters),
      periodLabel: period.label,
      filters: request.filters,
      accumulatedBalance: balanceThroughDate(allEntries, period.range.to),
      userLabel: request.userLabel,
      generatedAt: formatSaoPauloDateTime(this.now()),
    });
    return this.renderer.render(document);
  }
}
