import { describe, it, expect, vi, beforeEach } from 'vitest';

const fetchItemConnectionInfoMock = vi.fn();

vi.mock('@/lib/pluggy', () => ({
  fetchItemConnectionInfo: (...args: unknown[]) => fetchItemConnectionInfoMock(...args),
}));

const { RecordItemConnectionUseCase } = await import(
  '../../../../modules/open-finance/application/use-cases/record-item-connection'
);
const { FakeAccountRepository } = await import('./fake-account-repository');

describe('RecordItemConnectionUseCase', () => {
  let accountRepository: InstanceType<typeof FakeAccountRepository>;
  let useCase: InstanceType<typeof RecordItemConnectionUseCase>;

  beforeEach(() => {
    vi.clearAllMocks();
    accountRepository = new FakeAccountRepository();
    useCase = new RecordItemConnectionUseCase(accountRepository);
  });

  it('creates an account per item account with the item status', async () => {
    fetchItemConnectionInfoMock.mockResolvedValue({
      bank: 'itau',
      status: 'UPDATED',
      accounts: [{ id: 'account-1', accountType: 'CHECKING_ACCOUNT' }],
    });

    await useCase.execute('user-1', 'item-1');

    const account = await accountRepository.findByPluggyAccountId('account-1');
    expect(account?.bank).toBe('itau');
    expect(account?.itemStatus).toBe('UPDATED');
    expect(account?.lastSyncedAt).toBeNull();
  });

  it('refreshes item status without clobbering an existing account`s sync history', async () => {
    await accountRepository.upsert({
      userId: 'user-1',
      pluggyAccountId: 'account-1',
      pluggyItemId: 'item-1',
      bank: 'itau',
      accountType: 'CHECKING_ACCOUNT',
      itemStatus: 'UPDATED',
      lastSyncedAt: '2026-01-01T00:00:00.000Z',
    });
    fetchItemConnectionInfoMock.mockResolvedValue({
      bank: 'itau',
      status: 'LOGIN_ERROR',
      accounts: [{ id: 'account-1', accountType: 'CHECKING_ACCOUNT' }],
    });

    await useCase.execute('user-1', 'item-1');

    const account = await accountRepository.findByPluggyAccountId('account-1');
    expect(account?.itemStatus).toBe('LOGIN_ERROR');
    expect(account?.lastSyncedAt).toBe('2026-01-01T00:00:00.000Z');
  });
});
