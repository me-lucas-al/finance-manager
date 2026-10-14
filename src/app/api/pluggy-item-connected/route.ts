import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { DrizzleDataModeStore } from '@/modules/onboarding/infrastructure/drizzle-data-mode-store';
import { fetchItemOwner } from '@/lib/pluggy-items';
import { AccountOwnedByAnotherUserError, RecordItemConnectionUseCase } from '@/modules/open-finance/application/use-cases/record-item-connection';
import { SupabaseAccountRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';
import { buildPluggySync } from '@/modules/pluggy-sync/application/build-pluggy-sync';

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if ((await new DrizzleDataModeStore().getState(userId)).dataMode !== 'pluggy') {
    return NextResponse.json({ error: 'A conexão bancária só está disponível no modo Pluggy.' }, { status: 409 });
  }

  let itemId: string | undefined;
  try {
    ({ itemId } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
  if (!itemId) {
    return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
  }

  try {
    const owner = await fetchItemOwner(itemId);
    if (owner !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const accounts = await new RecordItemConnectionUseCase(new SupabaseAccountRepository()).execute(userId, itemId);
    const sync = await buildPluggySync()
      .syncItem(userId, itemId)
      .catch((error) => {
        console.error('Initial Pluggy sync failed:', error);
        return { imported: 0 };
      });

    return NextResponse.json({
      accounts: accounts.map((account) => ({ bank: account.bank, status: account.itemStatus })),
      imported: sync.imported,
    });
  } catch (error) {
    if (error instanceof AccountOwnedByAnotherUserError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error('Error recording Pluggy item connection:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
