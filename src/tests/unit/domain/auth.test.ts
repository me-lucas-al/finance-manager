import { describe, it, expect } from 'vitest';
import * as crypto from 'crypto';

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  return hashPassword(password, salt) === hash;
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

describe('Authentication Domain', () => {
  it('should hash a password correctly', () => {
    const salt = generateSalt();
    const hash = hashPassword('myPassword123', salt);
    expect(hash).toBeDefined();
    expect(hash.length).toBeGreaterThan(0);
  });

  it('should verify a correct password', () => {
    const salt = generateSalt();
    const hash = hashPassword('myPassword123', salt);
    expect(verifyPassword('myPassword123', hash, salt)).toBe(true);
  });

  it('should reject an incorrect password', () => {
    const salt = generateSalt();
    const hash = hashPassword('myPassword123', salt);
    expect(verifyPassword('wrongPassword', hash, salt)).toBe(false);
  });
});
