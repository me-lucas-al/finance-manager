import { LedgerResetter } from '../src/modules/onboarding/infrastructure/ledger-resetter';
import { getSupabaseAdmin } from '../src/shared/infrastructure/supabase-admin';

const userId = process.argv[2];
const confirmed = process.argv.includes('--confirm');

async function main() {
  if (!userId) throw new Error('Usage: tsx --env-file=.env scripts/disconnect-pluggy.ts <userId> [--confirm]');

  const { data, error } = await getSupabaseAdmin()
    .from('accounts')
    .select('id, bank, account_type, pluggy_item_id')
    .eq('user_id', userId);
  if (error) throw new Error(`Failed to list accounts: ${error.message}`);

  console.table(data);
  if (!confirmed) {
    console.log('Dry run. Pass --confirm to delete the Pluggy items and the accounts above.');
    return;
  }

  await new LedgerResetter().disconnectBanks(userId);
  console.log(`Disconnected ${data?.length ?? 0} accounts.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
