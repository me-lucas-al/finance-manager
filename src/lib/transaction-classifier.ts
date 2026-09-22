export type ClassifiedTransactionType =
  | 'INCOME'
  | 'EXPENSE'
  | 'CREDIT_CARD_PAYMENT'
  | 'INTERNAL_TRANSFER'
  | 'INVESTMENT'
  | 'REFUND';

export interface RawTransactionLike {
  id?: string;
  amount: number;
  type?: 'DEBIT' | 'CREDIT' | string;
  date: Date | string;
  description?: string | null;
  category?: string | null;
  isCreditCard?: boolean;
  bank?: string;
  accountId?: string;
  paymentData?: {
    payer?: {
      name?: string;
      documentNumber?: { value?: string; type?: string };
    };
    receiver?: {
      name?: string;
      documentNumber?: { value?: string; type?: string };
    };
  } | null;
}

export interface SanitizedTransaction<T extends RawTransactionLike = RawTransactionLike> {
  raw: T;
  classification: ClassifiedTransactionType;
  effectiveAmount: number;
}

export interface SanitizedSummary {
  totalIncome: number;
  totalExpenses: number;
  categoryTotals: Record<string, number>;
}

const REFUND_REGEX = /\b(estorno|reembolso|refund|cancelamento|devolu[cç][aã]o)\b/i;

const CC_PAYMENT_DESC_REGEX =
  /(pag(amento|to)?\s*(de\s*)?(fatura|cart[aã]o)|fatura\s*(cart[aã]o|nubank|ita[uú]|inter|bradesco|santander|c6)|(itaucard|nubank|inter)\s*pagamento|pgto\s*eletr\s*cobranca|pagamento\s*fatura|pagamento\s*recebido)/i;

const CC_PAYMENT_CATEGORY_REGEX =
  /(credit\s*card\s*payment|pagamento\s*de\s*fatura|cart[aã]o\s*de\s*cr[eé]dito)/i;

const INVESTMENT_REGEX =
  /(\b(cdb|rdb|lci|lca|tesouro(\s*direto)?|nuinvest|inter\s*dtvm|xp\s*investimentos|caixinha|caixinhas|cofrinho|cofrinhos)\b)|(aplica[cç][aã]o\s*(financeira|investimento|caixinha|cdb|rdb|fundo|poupanca|poupança)?)|(resgate\s*(caixinha|investimento|cdb|rdb|fundo|aplica[cç][aã]o|poupan[cç]a|tesouro|cofrinho)?)|(dinheiro\s*(reservado|retirado|guardado))/i;

const INVESTMENT_CATEGORY_REGEX =
  /^(investments?|investimentos?|aplica[cç][oõ]es)$/i;

const INTERNAL_TRANSFER_DESC_REGEX =
  /(mesma\s*titularidade|entre\s*contas|mesmo\s*titular|transf.*propria|transfer[eê]ncia\s*para\s*mesma)/i;

const TRANSFER_OR_PIX_REGEX =
  /(transfer[eê]ncia|transf|pix|ted|doc)/i;

function normalizeDate(d: Date | string): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d).slice(0, 10);
}

function areSamePerson(
  payer?: { name?: string; documentNumber?: { value?: string } },
  receiver?: { name?: string; documentNumber?: { value?: string } }
): boolean {
  if (payer?.documentNumber?.value && receiver?.documentNumber?.value) {
    const docPayer = payer.documentNumber.value.replace(/\D/g, '');
    const docReceiver = receiver.documentNumber.value.replace(/\D/g, '');
    if (docPayer && docPayer === docReceiver) return true;
  }

  if (payer?.name && receiver?.name) {
    const n1 = payer.name.trim().toLowerCase();
    const n2 = receiver.name.trim().toLowerCase();
    if (n1.length > 5 && n1 === n2) return true;
  }

  return false;
}

export function classifyTransaction(
  tx: RawTransactionLike,
  options: { hasCreditCardPurchases?: boolean } = {}
): ClassifiedTransactionType {
  const amt = Number(tx.amount);
  const isCredit = tx.type === 'CREDIT' || amt > 0;
  const description = tx.description || '';
  const category = tx.category || '';

  // 1. Credit Card Account Transactions
  if (tx.isCreditCard) {
    if (isCredit) {
      if (REFUND_REGEX.test(description)) {
        return 'REFUND';
      }
      // Any credit in a credit card invoice is payment received or statement balance credit
      return 'CREDIT_CARD_PAYMENT';
    }
    return 'EXPENSE';
  }

  // 2. Bank / Checking Account Transactions
  // 2A. Check for same-person transfer
  if (areSamePerson(tx.paymentData?.payer, tx.paymentData?.receiver)) {
    return 'INTERNAL_TRANSFER';
  }

  if (INTERNAL_TRANSFER_DESC_REGEX.test(description)) {
    return 'INTERNAL_TRANSFER';
  }

  // 2B. Investments (Aplicações, Resgates, Caixinhas, CDB, etc.)
  if (INVESTMENT_CATEGORY_REGEX.test(category) || INVESTMENT_REGEX.test(description)) {
    return 'INVESTMENT';
  }

  // 2C. Debit movements
  if (!isCredit) {
    // If credit card purchases are already tracked separately, paying the bill on the bank account
    // must not be counted as another expense to avoid double counting.
    const isCcBillPayment =
      CC_PAYMENT_CATEGORY_REGEX.test(category) || CC_PAYMENT_DESC_REGEX.test(description);

    if (isCcBillPayment && options.hasCreditCardPurchases !== false) {
      return 'CREDIT_CARD_PAYMENT';
    }

    return 'EXPENSE';
  }

  // 2D. Credit movements (Income, Refunds)
  if (REFUND_REGEX.test(description)) {
    return 'REFUND';
  }

  return 'INCOME';
}

/**
 * Sanitizes and groups transactions, detecting paired transfers between the user's accounts.
 */
export function sanitizeTransactions<T extends RawTransactionLike>(
  transactions: T[]
): {
  sanitized: SanitizedTransaction<T>[];
  summary: SanitizedSummary;
} {
  const hasCreditCardPurchases = transactions.some((t) => t.isCreditCard && (t.type === 'DEBIT' || Number(t.amount) < 0));

  // Detect paired internal transfers (one debit, one credit of equal amount within 1 day)
  const pairedTransferIndices = new Set<number>();
  const n = transactions.length;

  for (let i = 0; i < n; i++) {
    if (pairedTransferIndices.has(i)) continue;
    const tx1 = transactions[i];
    const amt1 = Math.abs(Number(tx1.amount));
    const isCredit1 = tx1.type === 'CREDIT' || Number(tx1.amount) > 0;
    const isTransfer1 = tx1.category === 'Transfers' || TRANSFER_OR_PIX_REGEX.test(tx1.description || '');

    if (!isTransfer1 || amt1 <= 0 || tx1.isCreditCard) continue;

    for (let j = i + 1; j < n; j++) {
      if (pairedTransferIndices.has(j)) continue;
      const tx2 = transactions[j];
      const amt2 = Math.abs(Number(tx2.amount));
      const isCredit2 = tx2.type === 'CREDIT' || Number(tx2.amount) > 0;
      const isTransfer2 = tx2.category === 'Transfers' || TRANSFER_OR_PIX_REGEX.test(tx2.description || '');

      if (!isTransfer2 || tx2.isCreditCard) continue;

      // Must be opposite directions (one credit, one debit) with matching amount
      if (isCredit1 !== isCredit2 && Math.abs(amt1 - amt2) < 0.01) {
        const d1 = new Date(normalizeDate(tx1.date)).getTime();
        const d2 = new Date(normalizeDate(tx2.date)).getTime();
        const diffDays = Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);

        if (diffDays <= 2) {
          pairedTransferIndices.add(i);
          pairedTransferIndices.add(j);
          break;
        }
      }
    }
  }

  let totalIncome = 0;
  let totalExpenses = 0;
  const categoryTotals: Record<string, number> = {};

  const sanitized: SanitizedTransaction<T>[] = transactions.map((tx, idx) => {
    let classification: ClassifiedTransactionType;

    if (pairedTransferIndices.has(idx)) {
      classification = 'INTERNAL_TRANSFER';
    } else {
      classification = classifyTransaction(tx, { hasCreditCardPurchases });
    }

    const absAmount = Math.abs(Number(tx.amount));
    const cat = tx.category || 'Outros';

    switch (classification) {
      case 'INCOME':
        totalIncome += absAmount;
        break;
      case 'EXPENSE':
        totalExpenses += absAmount;
        categoryTotals[cat] = (categoryTotals[cat] || 0) + absAmount;
        break;
      case 'REFUND':
        totalExpenses = Math.max(0, totalExpenses - absAmount);
        if (categoryTotals[cat]) {
          categoryTotals[cat] = Math.max(0, categoryTotals[cat] - absAmount);
        }
        break;
      case 'CREDIT_CARD_PAYMENT':
      case 'INTERNAL_TRANSFER':
      case 'INVESTMENT':
        // Neutral movements: not counted in operational income or expenses
        break;
    }

    return {
      raw: tx,
      classification,
      effectiveAmount: absAmount,
    };
  });

  return {
    sanitized,
    summary: {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      categoryTotals,
    },
  };
}
