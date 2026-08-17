import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../../../modules/auth/domain/password';

describe('Authentication Domain', () => {
  it('should hash a password', async () => {
    const hash = await hashPassword('myPassword123');
    expect(hash).toBeDefined();
    expect(hash).toContain('$argon2');
  });

  it('should reject a malformed stored hash instead of throwing', async () => {
    expect(await verifyPassword('myPassword123', 'not-a-valid-hash')).toBe(false);
  });

  it('should verify a correct password', async () => {
    const hash = await hashPassword('myPassword123');
    expect(await verifyPassword('myPassword123', hash)).toBe(true);
  });

  it('should reject an incorrect password', async () => {
    const hash = await hashPassword('myPassword123');
    expect(await verifyPassword('wrongPassword', hash)).toBe(false);
  });

  it('should produce different hashes for the same password', async () => {
    const hash1 = await hashPassword('myPassword123');
    const hash2 = await hashPassword('myPassword123');
    expect(hash1).not.toBe(hash2);
  });
});
