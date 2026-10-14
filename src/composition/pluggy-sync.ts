
import { PersistLedgerEntry } from '@/modules/pluggy-sync/application/persist-ledger-entry';
import { SyncAccountBalances } from '@/modules/pluggy-sync/application/sync-account-balances';
import { SyncPluggyHoldings } from '@/modules/pluggy-sync/application/sync-pluggy-holdings';
import { SyncPluggyItemUseCase } from '@/modules/pluggy-sync/application/sync-pluggy-item';
import { DrizzleLedgerWriter } from '@/modules/pluggy-sync/infrastructure/drizzle-ledger-writer';
import { entryChangeNotifier } from './finance';
import { accountRepository, transactionRepository } from './open-finance';
import { resolveCurrentPeriod } from './periods';

const ledgerWriter = new DrizzleLedgerWriter();

export const pluggySync = new SyncPluggyItemUseCase(
  accountRepository,
  new PersistLedgerEntry(ledgerWriter, transactionRepository),
  new SyncPluggyHoldings(ledgerWriter),
  new SyncAccountBalances(accountRepository),
  resolveCurrentPeriod,
  entryChangeNotifier,
);
