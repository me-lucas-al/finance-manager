import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { recordItemConnection } from '@/composition/open-finance';
import { pluggySync } from '@/composition/pluggy-sync';
import { pluggyModeRequiredResponse } from '../pluggy-mode';
import { fetchItemOwner } from '@/modules/pluggy-sync/infrastructure/pluggy/pluggy-items';
import { AccountOwnedByAnotherUserError } from '@/modules/open-finance/application/use-cases/record-item-connection';

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const modeResponse = await pluggyModeRequiredResponse(userId);
  if (modeResponse) return modeResponse;

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

    const accounts = await recordItemConnection.execute(userId, itemId);
    const sync = await pluggySync
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
