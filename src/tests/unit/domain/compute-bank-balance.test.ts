import { describe, expect, it } from 'vitest';
import type { LedgerEntry } from '@/modules/finance/domain/models/ledger-entry';
import type { Portfolio } from '@/modules/finance/domain/models/portfolio';
import { buildOverviewData } from '@/modules/finance/domain/services/build-overview-data';
import { computeBankBalance } from '@/modules/finance/domain/services/compute-bank-balance';

const entry = (kind: LedgerEntry['kind'], amount: number): LedgerEntry => ({
  id: `${kind}-${amount}`,
  kind,
  date: '2026-03-10',
  description: kind,
  category: 'Outros',
  amount,
  account: 'manual',
  fixed: false,
});

const entries = [entry('income', 1000), entry('expense', 400), entry('investment', 100)];
const holding = { id: 'h1', name: 'CDB', type: 'FIXED_INCOME', balance: 23000 };

describe('computeBankBalance', () => {
  it('adds the initial balance to the manual cash flow', () => {
    const portfolio: Portfolio = { holdings: [], accounts: [], initialBalance: 200 };
    expect(computeBankBalance(entries, portfolio)).toBe(700);
  });

  it('uses the balance reported by bank accounts and ignores the flow', () => {
    const portfolio: Portfolio = {
      holdings: [],
      accounts: [
        { id: 'a1', bank: 'nubank', accountType: 'CHECKING_ACCOUNT', balance: 1500.5, creditLimit: null },
        { id: 'a2', bank: 'itau', accountType: 'SAVINGS_ACCOUNT', balance: 500, creditLimit: null },
        { id: 'a3', bank: 'nubank', accountType: 'CREDIT_CARD', balance: 900, creditLimit: 5000 },
      ],
      initialBalance: 0,
    };
    expect(computeBankBalance(entries, portfolio)).toBe(2000.5);
  });

  it('does not let a synced holding change the balance', () => {
    const withHolding: Portfolio = { holdings: [holding], accounts: [], initialBalance: 0 };
    expect(computeBankBalance(entries, withHolding)).toBe(500);
  });
});

describe('buildOverviewData with portfolio', () => {
  it('separates the holding value from the bank balance', () => {
    const data = buildOverviewData(entries, '2026-03', { holdings: [holding], accounts: [], initialBalance: 0 });
    expect(data.bankTotal).toBe(500);
    expect(data.investmentTotal).toBe(23000);
    expect(data.investmentCount).toBe(1);
  });

  it('ends the evolution line at the real bank balance and reports card usage', () => {
    const data = buildOverviewData(entries, '2026-03', {
      holdings: [],
      accounts: [
        { id: 'a1', bank: 'nubank', accountType: 'CHECKING_ACCOUNT', balance: 3000, creditLimit: null },
        { id: 'a3', bank: 'nubank', accountType: 'CREDIT_CARD', balance: 900, creditLimit: 3000 },
      ],
      initialBalance: 0,
    });
    expect(data.evolutionData.at(-1)?.value).toBe(3000);
    expect(data.cardTotal).toBe(900);
    expect(data.cardUsedPercentage).toBe(30);
  });
});
