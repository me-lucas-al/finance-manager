import { describe, it, expect } from 'vitest';
import { resolveOwnerUserId, OwnerResolutionError } from '@/modules/auth/domain/resolve-owner-user-id';

describe('resolveOwnerUserId', () => {
  it('returns the session user when no owner is configured', () => {
    expect(resolveOwnerUserId('user-1', undefined)).toBe('user-1');
  });

  it('returns the session user when it matches the configured owner', () => {
    expect(resolveOwnerUserId('user-1', 'user-1')).toBe('user-1');
  });

  it('throws unauthenticated when there is no session user', () => {
    expect(() => resolveOwnerUserId(undefined, 'user-1')).toThrow(OwnerResolutionError);
    expect(() => resolveOwnerUserId(null, undefined)).toThrow('No authenticated session');
  });

  it('throws owner_mismatch when the session user is not the configured owner', () => {
    try {
      resolveOwnerUserId('user-2', 'user-1');
      throw new Error('expected failure');
    } catch (error) {
      expect(error).toBeInstanceOf(OwnerResolutionError);
      expect((error as OwnerResolutionError).failure).toBe('owner_mismatch');
    }
  });
});
