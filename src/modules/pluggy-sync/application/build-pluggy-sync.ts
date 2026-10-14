import { SyncPluggyItemUseCase } from './sync-pluggy-item';
import { PersistLedgerEntry } from './persist-ledger-entry';
import { SyncPluggyHoldings } from './sync-pluggy-holdings';
import { DrizzleLedgerWriter } from '../infrastructure/drizzle-ledger-writer';
import { SupabaseAccountRepository, SupabaseTransactionRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';
import { ResolveCurrentPeriodUseCase } from '@/modules/periods/application/use-cases/resolve-current-period';
import { DrizzlePeriodRepository } from '@/modules/periods/infrastructure/repositories';
import { DrizzleSettingRepository } from '@/modules/users/infrastructure/repositories';

export function buildPluggySync(): SyncPluggyItemUseCase {
  const ledger = new DrizzleLedgerWriter();

  return new SyncPluggyItemUseCase(
    new SupabaseAccountRepository(),
    new PersistLedgerEntry(ledger, new SupabaseTransactionRepository()),
    new SyncPluggyHoldings(ledger),
    new ResolveCurrentPeriodUseCase(new DrizzlePeriodRepository(), new DrizzleSettingRepository()),
  );
}
