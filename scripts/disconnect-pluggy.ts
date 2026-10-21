import { parseArgs } from 'node:util';
import { deletePluggyItem } from '../src/modules/pluggy-sync/infrastructure/pluggy/pluggy-items';
import { getSupabaseAdmin } from '../src/shared/infrastructure/supabase-admin';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { confirm: { type: 'boolean', default: false } },
});
const [userId] = positionals;

async function removeItems(itemIds: string[]): Promise<string[]> {
  const failed: string[] = [];
  for (const itemId of itemIds) {
    await deletePluggyItem(itemId).catch((error) => {
      failed.push(itemId);
      console.error(`Failed to delete Pluggy item ${itemId}:`, error);
    });
  }
  return failed;
}

async function main() {
  if (!userId) throw new Error('Usage: tsx --env-file=.env scripts/disconnect-pluggy.ts <userId> [--confirm]');

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('accounts')
    .select('id, bank, account_type, pluggy_item_id')
    .eq('user_id', userId);
  if (error) throw new Error(`Failed to list accounts: ${error.message}`);

  console.table(data);
  if (!values.confirm) {
    console.log('Dry run. Pass --confirm to delete the Pluggy items and the accounts above.');
    return;
  }

  const itemIds = [...new Set((data ?? []).map((row) => row.pluggy_item_id as string))];
  const failed = await removeItems(itemIds);
  if (failed.length > 0) throw new Error(`Accounts kept. Could not delete Pluggy items: ${failed.join(', ')}`);

  const { error: deleteError } = await supabase.from('accounts').delete().eq('user_id', userId);
  if (deleteError) throw new Error(`Failed to delete accounts: ${deleteError.message}`);
  console.log(`Disconnected ${itemIds.length} items and ${data?.length ?? 0} accounts.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
