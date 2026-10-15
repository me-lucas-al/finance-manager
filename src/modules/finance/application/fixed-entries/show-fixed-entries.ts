import { computeBankBalance } from '../../domain/services/compute-bank-balance';
import { summarizeFixedEntries } from '../../domain/services/summarize-fixed-entries';
import type { LedgerService } from '../services/ledger-service';
import type { PortfolioService } from '../services/portfolio-service';
import { formatFixedEntriesMessage } from './fixed-entry-message-formatter';
import type { ListFixedEntriesUseCase } from './list-fixed-entries';

export class ShowFixedEntriesUseCase {
  constructor(
    private readonly listFixedEntries: Pick<ListFixedEntriesUseCase, 'execute'>,
    private readonly ledger: Pick<LedgerService, 'load'>,
    private readonly portfolio: Pick<PortfolioService, 'load'>
  ) {}

  async execute(userId: string): Promise<string> {
    const [views, entries, portfolio] = await Promise.all([
      this.listFixedEntries.execute(userId),
      this.ledger.load(userId),
      this.portfolio.load(userId),
    ]);
    return formatFixedEntriesMessage(views, summarizeFixedEntries(views, computeBankBalance(entries, portfolio)));
  }
}
