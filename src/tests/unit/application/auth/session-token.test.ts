import { describe, it, expect, beforeAll } from 'vitest';
import { signSessionToken, verifySessionToken } from '../../../../modules/auth/application/session-token';

describe('Session Token', () => {
  beforeAll(() => {
    process.env.AUTH_SECRET = 'test-secret-value-not-for-production';
  });

  it('should sign and verify a valid token', async () => {
    const token = await signSessionToken({ userId: 'user-1', email: 'test@example.com' });
    const payload = await verifySessionToken(token);

    expect(payload).toEqual({ userId: 'user-1', email: 'test@example.com' });
  });

  it('should reject a tampered token', async () => {
    const token = await signSessionToken({ userId: 'user-1', email: 'test@example.com' });
    const tampered = token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a');

    const payload = await verifySessionToken(tampered);
    expect(payload).toBeNull();
  });

  it('should reject a garbage token', async () => {
    const payload = await verifySessionToken('not-a-real-token');
    expect(payload).toBeNull();
  });

  it('should reject a token signed with a different secret', async () => {
    const token = await signSessionToken({ userId: 'user-1', email: 'test@example.com' });

    process.env.AUTH_SECRET = 'a-different-secret-value';
    const payload = await verifySessionToken(token);

    expect(payload).toBeNull();
    process.env.AUTH_SECRET = 'test-secret-value-not-for-production';
  });
});
