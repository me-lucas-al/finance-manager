import { describe, it, expect, vi, beforeEach } from 'vitest';

const authMock = vi.fn();
vi.mock('@/auth', () => ({ auth: authMock }));

const loadLedgerMock = vi.fn();
vi.mock('@/modules/finance/application/services/load-ledger', () => ({ loadLedger: loadLedgerMock }));

const { GET } = await import('../../../../app/api/entries/version/route');

const expense = (id: string, amount: number) => ({
  id,
  kind: 'expense' as const,
  date: '2026-03-01',
  description: id,
  category: 'Mercado',
  amount,
  account: 'Manual',
});

describe('GET /api/entries/version', () => {
  beforeEach(() => {
    authMock.mockReset();
    loadLedgerMock.mockReset();
  });

  it('returns 401 without a session', async () => {
    authMock.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(loadLedgerMock).not.toHaveBeenCalled();
  });

  it('returns a version that changes when the ledger changes', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1' } });
    loadLedgerMock.mockResolvedValueOnce([expense('a', 10)]).mockResolvedValueOnce([expense('a', 10), expense('b', 5)]);

    const first = await (await GET()).json();
    const second = await (await GET()).json();

    expect(loadLedgerMock).toHaveBeenCalledWith('user-1');
    expect(first.version).not.toBe(second.version);
  });
});
