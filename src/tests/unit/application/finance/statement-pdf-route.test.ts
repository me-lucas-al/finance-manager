import { describe, it, expect, vi, beforeEach } from 'vitest';

const authMock = vi.fn();
vi.mock('@/auth', () => ({ auth: authMock }));

const loadLedgerMock = vi.fn();
vi.mock('@/composition/finance-loaders', () => ({ loadLedger: loadLedgerMock }));

const { GET } = await import('../../../../app/api/statement/pdf/route');
const { statementUserLabel } = await import('../../../../app/api/statement/pdf/statement-user-label');

const ledger = [
  { id: 'a', kind: 'expense', date: '2026-03-02', description: 'Pão e Café', category: 'Alimentação', amount: 12.5, account: 'Manual' },
  { id: 'b', kind: 'income', date: '2026-03-05', description: 'Salário', category: 'Salário', amount: 3000, account: 'Manual' },
];

const request = (query: string) => new Request(`http://localhost/api/statement/pdf${query}`);

async function signature(response: Response): Promise<string> {
  const bytes = new Uint8Array(await response.arrayBuffer());
  return new TextDecoder('latin1').decode(bytes.slice(0, 5));
}

describe('GET /api/statement/pdf', () => {
  beforeEach(() => {
    authMock.mockReset();
    loadLedgerMock.mockReset();
    loadLedgerMock.mockResolvedValue(ledger);
  });

  it('returns 401 without a session', async () => {
    authMock.mockResolvedValue(null);

    expect((await GET(request('?month=2026-03'))).status).toBe(401);
    expect(loadLedgerMock).not.toHaveBeenCalled();
  });

  it('returns the pdf of the session user with download headers', async () => {
    authMock.mockResolvedValue({ user: { id: 'u1', name: 'Lucas' } });

    const response = await GET(request('?month=2026-03&type=expense&category=Alimenta%C3%A7%C3%A3o&q=p%C3%A3o'));

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(response.headers.get('Content-Disposition')).toBe('attachment; filename=extrato-2026-03.pdf');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await signature(response)).toBe('%PDF-');
    expect(loadLedgerMock).toHaveBeenCalledWith('u1');
  });

  it('rejects an invalid month', async () => {
    authMock.mockResolvedValue({ user: { id: 'u1' } });

    expect((await GET(request('?month=2026-13'))).status).toBe(400);
    expect((await GET(request('?month=abc'))).status).toBe(400);
  });

  it('falls back to defaults for invalid filters and a missing month', async () => {
    authMock.mockResolvedValue({ user: { id: 'u1' } });

    const response = await GET(request('?type=bogus'));

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Disposition')).toMatch(/^attachment; filename=extrato-\d{4}-\d{2}\.pdf$/);
  });
});

describe('statementUserLabel', () => {
  it('prefers name, then email, then a fallback', () => {
    expect(statementUserLabel({ name: ' Lucas ', email: 'a@b.c' })).toBe('Lucas');
    expect(statementUserLabel({ name: null, email: 'a@b.c' })).toBe('a@b.c');
    expect(statementUserLabel(undefined)).toBe('Usuário');
  });
});
