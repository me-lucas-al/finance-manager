import type { NewTransaction } from '../domain/repositories/transaction-repository';

export function buildTransactionInsert(data: NewTransaction): Record<string, unknown> {
  return {
    user_id: data.userId,
    pluggy_transaction_id: data.pluggyTransactionId ?? null,
    account_id: data.accountId,
    bank: data.bank ?? 'Manual',
    amount: data.amount,
    description: data.description,
    occurred_at: data.occurredAt,
    category: data.category,
    category_suggested: data.categorySuggested,
    reason: data.reason,
    status: data.status,
    source: data.source ?? 'manual',
    necessity: data.necessity ?? null,
    telegram_question_message_id: data.telegramQuestionMessageId,
    ...(data.fixedEntryId
      ? { fixed_entry_id: data.fixedEntryId, fixed_reference_month: data.fixedReferenceMonth ?? null }
      : {}),
  };
}
