import type { CreditCard } from '@/modules/finance/domain/models/credit-card';

export function makeCreditCard(overrides: Partial<CreditCard> = {}): CreditCard {
  return {
    id: 'card-1',
    userId: 'user-1',
    name: 'Nubank',
    lastDigits: '1234',
    creditLimit: 5000,
    closingDay: 10,
    createdAt: new Date('2026-01-01T12:00:00Z'),
    updatedAt: new Date('2026-01-01T12:00:00Z'),
    ...overrides,
  };
}
