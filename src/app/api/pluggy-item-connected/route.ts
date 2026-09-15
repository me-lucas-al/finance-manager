import { NextRequest, NextResponse } from 'next/server';
import { getEffectiveUserId } from '@/app/actions/require-session';
import { RecordItemConnectionUseCase } from '@/modules/open-finance/application/use-cases/record-item-connection';
import { SupabaseAccountRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';

export async function POST(req: NextRequest) {
  const userId = await getEffectiveUserId();
  if (!userId) {
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
    const accounts = await useCase.execute(userId, itemId);
    return NextResponse.json({
      accounts: accounts.map((account) => ({ bank: account.bank, status: account.itemStatus })),
    });
  } catch (error) {
    console.error('Error recording Pluggy item connection:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
