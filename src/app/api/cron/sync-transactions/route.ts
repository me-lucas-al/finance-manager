import { NextRequest, NextResponse } from 'next/server';
import { fetchNewTransactions } from '@/lib/pluggy';
import { IngestPluggyTransactionUseCase } from '@/modules/open-finance/application/use-cases/ingest-pluggy-transaction';
import { AskForTransactionReasonUseCase } from '@/modules/open-finance/application/use-cases/ask-transaction-reason';
import {
  SupabaseAccountRepository,
  SupabaseTransactionRepository,
} from '@/modules/open-finance/infrastructure/supabase-repositories';

const FALLBACK_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;

// Safety net for the Pluggy webhook: a delivery can be lost, or Pluggy can
// skip re-sending transactions/created for ids it already reported under a
// previously deleted item, so nothing else would ever re-fetch them. Runs
// daily and re-derives each account's window from its own last_synced_at
// instead of a fixed cutoff, so it stays cheap once caught up.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = process.env.FINANCE_OWNER_USER_ID;
  if (!userId) {
    return NextResponse.json({ error: 'FINANCE_OWNER_USER_ID is not configured' }, { status: 500 });
  }

  const accountRepository = new SupabaseAccountRepository();
  const transactionRepository = new SupabaseTransactionRepository();
  const ingestUseCase = new IngestPluggyTransactionUseCase(accountRepository, transactionRepository);
  const askUseCase = new AskForTransactionReasonUseCase(transactionRepository);

  const accounts = await accountRepository.findAllByUserId(userId);
  let checkedCount = 0;
  const errors: { accountId: string; error: string }[] = [];

  for (const account of accounts) {
    const since = account.lastSyncedAt
      ? new Date(account.lastSyncedAt).toISOString()
      : new Date(Date.now() - FALLBACK_LOOKBACK_MS).toISOString();
    try {
      const transactions = await fetchNewTransactions(account.pluggyAccountId, since);
      for (const transaction of transactions) {
        checkedCount++;
        const stored = await ingestUseCase.execute(userId, account.pluggyItemId, account.pluggyAccountId, transaction);
        if (stored && !stored.telegramQuestionMessageId) {
          await askUseCase.execute(stored);
        }
      }
    } catch (error) {
      errors.push({ accountId: account.id, error: error instanceof Error ? error.message : String(error) });
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    accountsChecked: accounts.length,
    transactionsChecked: checkedCount,
    errors: errors.length > 0 ? errors : undefined,
  });
}
