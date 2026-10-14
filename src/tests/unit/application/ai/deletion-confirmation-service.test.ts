import { describe, it, expect } from 'vitest';
import { DeletionConfirmationService } from '@/modules/ai/application/services/deletion-confirmation-service';

const target = { userId: 'u1', kind: 'expense', id: 'e1' };

describe('DeletionConfirmationService', () => {
  it('accepts a token only in a later turn', () => {
    const service = new DeletionConfirmationService('secret');
    const token = service.issue(target, 'turn-1');

    expect(service.isConfirmed(token, target, 'turn-1')).toBe(false);
    expect(service.isConfirmed(token, target, 'turn-2')).toBe(true);
  });

  it('rejects tokens for a different entry, user or secret', () => {
    const service = new DeletionConfirmationService('secret');
    const token = service.issue(target, 'turn-1');

    expect(service.isConfirmed(token, { ...target, id: 'e2' }, 'turn-2')).toBe(false);
    expect(service.isConfirmed(token, { ...target, userId: 'u2' }, 'turn-2')).toBe(false);
    expect(new DeletionConfirmationService('other').isConfirmed(token, target, 'turn-2')).toBe(false);
  });

  it('rejects expired, tampered and malformed tokens', () => {
    let now = 1_000_000;
    const service = new DeletionConfirmationService('secret', () => now);
    const token = service.issue(target, 'turn-1');

    now += 11 * 60 * 1000;
    expect(service.isConfirmed(token, target, 'turn-2')).toBe(false);

    now = 1_000_000;
    const [expiresAt, turn, signature] = token.split('.');
    expect(service.isConfirmed(`${expiresAt}.${turn}.${signature.slice(1)}0`, target, 'turn-2')).toBe(false);
    expect(service.isConfirmed('garbage', target, 'turn-2')).toBe(false);
    expect(service.isConfirmed('', target, 'turn-2')).toBe(false);
  });
});
