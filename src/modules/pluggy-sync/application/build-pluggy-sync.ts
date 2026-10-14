import { SyncPluggyItemUseCase } from './sync-pluggy-item';
import { PersistLedgerEntry } from './persist-ledger-entry';
import { NextEntryChangeNotifier } from '@/modules/finance/infrastructure/next-entry-change-notifier';
import { SyncAccountBalances } from './sync-account-balances';
import { SyncPluggyHoldings } from './sync-pluggy-holdings';
import { DrizzleLedgerWriter } from '../infrastructure/drizzle-ledger-writer';
import { SupabaseAccountRepository, SupabaseTransactionRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';
import { ResolveCurrentPeriodUseCase } from '@/modules/periods/application/use-cases/resolve-current-period';
import { DrizzlePeriodRepository } from '@/modules/periods/infrastructure/repositories';
import { DrizzleSettingRepository } from '@/modules/users/infrastructure/repositories';

export function buildPluggySync(): SyncPluggyItemUseCase {
  const ledger = new DrizzleLedgerWriter();
  const accounts = new SupabaseAccountRepository();

  return new SyncPluggyItemUseCase(
    accounts,
    new PersistLedgerEntry(ledger, new SupabaseTransactionRepository()),
    new SyncPluggyHoldings(ledger),
    new SyncAccountBalances(accounts),
    new ResolveCurrentPeriodUseCase(new DrizzlePeriodRepository(), new DrizzleSettingRepository()),
    new NextEntryChangeNotifier(),
  );
}
