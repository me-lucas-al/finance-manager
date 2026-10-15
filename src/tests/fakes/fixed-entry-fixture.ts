import type { FixedEntry } from '@/modules/finance/domain/models/fixed-entry';

export function makeFixedEntry(overrides: Partial<FixedEntry> = {}): FixedEntry {
  return {
    id: 'fx-1',
    userId: 'user-1',
    kind: 'expense',
    description: 'Internet',
    amount: 120,
    category: 'Moradia',
    dueDay: 10,
    active: true,
    startsOn: '2026-01-01',
    createdAt: new Date('2026-01-01T12:00:00Z'),
    updatedAt: new Date('2026-01-01T12:00:00Z'),
    ...overrides,
  };
}
