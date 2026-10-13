import { totalsOf } from '../../domain/services/summarize-ledger';
import { summarizeFixedEntries } from '../../domain/services/summarize-fixed-entries';
import type { LedgerService } from '../services/ledger-service';
import { formatFixedEntriesMessage } from './fixed-entry-message-formatter';
import type { ListFixedEntriesUseCase } from './list-fixed-entries';

export class ShowFixedEntriesUseCase {
  constructor(
    private readonly listFixedEntries: Pick<ListFixedEntriesUseCase, 'execute'>,
    private readonly ledger: Pick<LedgerService, 'load'>
  ) {}

  async execute(userId: string): Promise<string> {
    const [views, entries] = await Promise.all([this.listFixedEntries.execute(userId), this.ledger.load(userId)]);
    return formatFixedEntriesMessage(views, summarizeFixedEntries(views, totalsOf(entries).balance));
  }
}
