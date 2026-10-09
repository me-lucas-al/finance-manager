import { describe, it, expect } from 'vitest';
import { detectSpendingPatterns } from '@/modules/finance/domain/services/detect-spending-patterns';
import { Transaction } from '@/modules/open-finance/domain/repositories/transaction-repository';

function makeMockTx(amount: number, category: string): Transaction {
  return {
    id: Math.random().toString(),
    userId: 'user-1',
    pluggyTransactionId: null,
    accountId: null,
    bank: 'Manual',
    amount,
    description: 'Item',
    occurredAt: '2026-10-01',
    category,
    categorySuggested: null,
    reason: null,
    status: 'categorized',
    source: 'manual',
    necessity: 'superfluo',
    telegramQuestionMessageId: null,
    createdAt: new Date().toISOString(),
  };
}

describe('detectSpendingPatterns', () => {
  it('detects repeated small expenses in same category', () => {
    const past = [
      makeMockTx(25, 'Delivery'),
      makeMockTx(30, 'Delivery'),
      makeMockTx(20, 'Delivery'),
    ];
    const report = detectSpendingPatterns({
      newAmount: 28,
      category: 'Delivery',
      recentTransactions: past,
    });

    expect(report.hasAlerts).toBe(true);
    expect(report.alerts.some((a) => a.type === 'repeated_small')).toBe(true);
  });

  it('detects spike above average', () => {
    const past = [
      makeMockTx(50, 'Mercado'),
      makeMockTx(60, 'Mercado'),
      makeMockTx(55, 'Mercado'),
    ];
    const report = detectSpendingPatterns({
      newAmount: 250,
      category: 'Mercado',
      recentTransactions: past,
    });

    expect(report.hasAlerts).toBe(true);
    expect(report.alerts.some((a) => a.type === 'spike_above_average')).toBe(true);
  });

  it('detects recurring subscription pattern', () => {
    const past = [
      makeMockTx(39.9, 'Assinaturas'),
      makeMockTx(39.9, 'Assinaturas'),
    ];
    const report = detectSpendingPatterns({
      newAmount: 39.9,
      category: 'Assinaturas',
      recentTransactions: past,
    });

    expect(report.hasAlerts).toBe(true);
    expect(report.alerts.some((a) => a.type === 'subscription_like')).toBe(true);
  });

  it('detects near category limit', () => {
    const past = [makeMockTx(350, 'Lazer')];
    const report = detectSpendingPatterns({
      newAmount: 60,
      category: 'Lazer',
      recentTransactions: past,
      categoryLimit: 500,
    });

    expect(report.hasAlerts).toBe(true);
    expect(report.alerts.some((a) => a.type === 'near_category_limit')).toBe(true);
  });

  it('returns no alerts for normal single transaction without history', () => {
    const report = detectSpendingPatterns({
      newAmount: 50,
      category: 'Educação',
      recentTransactions: [],
    });

    expect(report.hasAlerts).toBe(false);
    expect(report.alerts).toHaveLength(0);
  });
});
