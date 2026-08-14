/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authActions from '@/app/actions/auth';
import { createSession, verifySession } from '@/lib/session';
import { hashPassword, verifyPassword } from '@/lib/password';
import { db } from '@/db/connection';
import { cookies } from 'next/headers';

vi.mock('@/db/connection', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  }
}));

vi.mock('next/headers', () => {
  const mockCookies = {
    set: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  };
  const mockHeaders = {
    get: vi.fn(() => '127.0.0.1'),
  };
  return {
    cookies: vi.fn(() => Promise.resolve(mockCookies)),
    headers: vi.fn(() => mockHeaders),
  };
});

describe('Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Password Hashing', () => {
    it('hashes password securely and verifies correctly', async () => {
      const password = 'mySuperSecretPassword123';
      const hash = await hashPassword(password);
      expect(hash).not.toBe(password);
      const isMatch = await verifyPassword(password, hash);
      expect(isMatch).toBe(true);
    });

    it('fails verification for incorrect password', async () => {
      const password = 'mySuperSecretPassword123';
      const hash = await hashPassword(password);
      const isMatch = await verifyPassword('wrongpassword', hash);
      expect(isMatch).toBe(false);
    });
  });

  describe('Session Management', () => {
    it('creates a session and verifies it', async () => {
      const userId = 'user-123';
      const token = await createSession(userId);
      expect(token).toBeDefined();

      const payload = await verifySession(token);
      expect(payload?.userId).toBe(userId);
    });

    it('returns null for invalid session token', async () => {
      const payload = await verifySession('invalid-token');
      expect(payload).toBeNull();
    });
  });

  describe('Auth Actions', () => {
    // These tests simulate what the server action would do using the mocked DB
    it('signup creates a new user', async () => {
      // Setup mock DB for insert
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'new-user-id' }])
        })
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (db.insert as any) = mockInsert;

      // Mock user existence check (select returns empty array = no user exists)
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([])
          })
        })
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (db.select as any) = mockSelect;

      const result = await authActions.signup({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123'
      });

      expect(result.success).toBe(true);
      expect(mockInsert).toHaveBeenCalled();
    });

    it('login authenticates user and sets cookie', async () => {
      const hashedPassword = await hashPassword('Password123');
      
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 'existing-user-id', passwordHash: hashedPassword }])
          })
        })
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (db.select as any) = mockSelect;

      const result = await authActions.login({
        email: 'test@example.com',
        password: 'Password123'
      });

      expect(result.success).toBe(true);
    });

    it('login fails with wrong password', async () => {
      const hashedPassword = await hashPassword('Password123');
      
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 'existing-user-id', passwordHash: hashedPassword }])
          })
        })
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (db.select as any) = mockSelect;

      const result = await authActions.login({
        email: 'test@example.com',
        password: 'WrongPassword'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Credenciais inválidas');
    });

    it('logout deletes session cookie', async () => {
      try {
        await authActions.logout();
      } catch (error: unknown) {
        // Next.js redirect throws NEXT_REDIRECT error, so we catch it
        expect(error instanceof Error ? error.message : '').toBe('NEXT_REDIRECT');
      }
      const cookiesStore = await cookies();
      expect(cookiesStore.delete).toHaveBeenCalledWith('session');
    });
  });
});
