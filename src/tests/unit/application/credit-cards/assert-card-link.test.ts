import { describe, it, expect, vi } from 'vitest';
import { assertCardLink } from '@/modules/finance/application/credit-cards/assert-card-link';
import { EntryValidationError } from '@/modules/finance/domain/models/entry-errors';

describe('assertCardLink', () => {
  const validator = { assertUsable: vi.fn(async () => {}) };

  it('allows clearing the card on any kind of entry', async () => {
    await expect(assertCardLink(validator, 'u', 'income', null)).resolves.toBeUndefined();
    await expect(assertCardLink(validator, 'u', 'expense', null)).resolves.toBeUndefined();
    expect(validator.assertUsable).not.toHaveBeenCalled();
  });

  it('ignores an absent card', async () => {
    await expect(assertCardLink(validator, 'u', 'investment', undefined)).resolves.toBeUndefined();
  });

  it('rejects a card on non-expense entries', async () => {
    await expect(assertCardLink(validator, 'u', 'income', 'card-1')).rejects.toThrow(EntryValidationError);
  });

  it('checks usability for expenses', async () => {
    await assertCardLink(validator, 'u', 'expense', 'card-1');

    expect(validator.assertUsable).toHaveBeenCalledWith('u', 'card-1');
  });
});
