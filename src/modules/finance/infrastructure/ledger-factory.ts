import { SupabaseTransactionRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';
import { LedgerService } from '../application/services/ledger-service';
import { PersistenceLedgerSource } from './persistence-ledger-source';

export function createLedgerService(): LedgerService {
  return new LedgerService(new PersistenceLedgerSource(new SupabaseTransactionRepository()));
}
