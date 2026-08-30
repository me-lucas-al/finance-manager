import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { RecordItemConnectionUseCase } from '@/modules/open-finance/application/use-cases/record-item-connection';
import { SupabaseAccountRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';

// Open Finance sync is set up by a single person — FINANCE_OWNER_USER_ID is
// that user's id (from the `users` table) — used to attribute the connected
// account, matching how /api/webhook-pluggy attributes ingested transactions.
function getOwnerUserId(): string {
  const userId = process.env.FINANCE_OWNER_USER_ID;
  if (!userId) throw new Error('FINANCE_OWNER_USER_ID is not configured.');
  return userId;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    const useCase = new RecordItemConnectionUseCase(new SupabaseAccountRepository());
    const accounts = await useCase.execute(getOwnerUserId(), itemId);
    return NextResponse.json({
      accounts: accounts.map((account) => ({ bank: account.bank, status: account.itemStatus })),
    });
  } catch (error) {
    console.error('Error recording Pluggy item connection:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
