import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makePluggyTransaction } from './pluggy-transaction-factory';

const fetchItemBankNameMock = vi.fn();
const fetchAccountTypeMock = vi.fn();

vi.mock('@/lib/pluggy', () => ({
  fetchItemBankName: (...args: unknown[]) => fetchItemBankNameMock(...args),
  fetchAccountType: (...args: unknown[]) => fetchAccountTypeMock(...args),
}));

const { IngestPluggyTransactionUseCase } = await import(
  '../../../../modules/open-finance/application/use-cases/ingest-pluggy-transaction'
);
const { FakeAccountRepository } = await import('./fake-account-repository');
const { FakeTransactionRepository } = await import('./fake-transaction-repository');

describe('IngestPluggyTransactionUseCase', () => {
  let accountRepository: InstanceType<typeof FakeAccountRepository>;
  let transactionRepository: InstanceType<typeof FakeTransactionRepository>;
  let useCase: InstanceType<typeof IngestPluggyTransactionUseCase>;

  beforeEach(() => {
    vi.clearAllMocks();
    accountRepository = new FakeAccountRepository();
    transactionRepository = new FakeTransactionRepository();
    useCase = new IngestPluggyTransactionUseCase(accountRepository, transactionRepository);
  });

  it('stores CREDIT movements (incoming money)', async () => {
    fetchItemBankNameMock.mockResolvedValue('itau');
    fetchAccountTypeMock.mockResolvedValue('CHECKING_ACCOUNT');

    const result = await useCase.execute(
      'user-1',
      'item-1',
      'account-1',
      makePluggyTransaction({ type: 'CREDIT', amount: 500, description: 'Pix Recebido' }),
    );

    expect(result).not.toBeNull();
    expect(result?.amount).toBe(500);
    expect(result?.description).toBe('Pix Recebido');
    expect(await transactionRepository.findByPluggyId('txn-1')).not.toBeNull();
  });

  it('creates a new account and a positive-amount transaction for a DEBIT movement', async () => {
    fetchItemBankNameMock.mockResolvedValue('itau');
    fetchAccountTypeMock.mockResolvedValue('CHECKING_ACCOUNT');

    const result = await useCase.execute('user-1', 'item-1', 'account-1', makePluggyTransaction());

    expect(result).not.toBeNull();
    expect(result?.amount).toBe(150.5);
    expect(result?.status).toBe('pending_reason');
    expect(result?.bank).toBe('itau');

    const account = await accountRepository.findByPluggyAccountId('account-1');
    expect(account?.accountType).toBe('CHECKING_ACCOUNT');
  });

  it('is idempotent: a repeated webhook delivery does not create a duplicate', async () => {
    fetchItemBankNameMock.mockResolvedValue('nubank');
    fetchAccountTypeMock.mockResolvedValue('CHECKING_ACCOUNT');

    const first = await useCase.execute('user-1', 'item-1', 'account-1', makePluggyTransaction());
    const second = await useCase.execute('user-1', 'item-1', 'account-1', makePluggyTransaction());

    expect(second?.id).toBe(first?.id);
    expect((await transactionRepository.findAllByUserId('user-1')).length).toBe(1);
  });

  it('refreshes last_synced_at on the existing account without re-fetching its bank/type', async () => {
    await accountRepository.upsert({
      userId: 'user-1',
      pluggyAccountId: 'account-1',
      pluggyItemId: 'item-1',
      bank: 'inter',
      accountType: 'CHECKING_ACCOUNT',
      lastSyncedAt: '2026-01-01T00:00:00.000Z',
    });

    await useCase.execute('user-1', 'item-1', 'account-1', makePluggyTransaction({ id: 'txn-2' }));

    expect(fetchItemBankNameMock).not.toHaveBeenCalled();
    expect(fetchAccountTypeMock).not.toHaveBeenCalled();
    const account = await accountRepository.findByPluggyAccountId('account-1');
    expect(account?.lastSyncedAt).not.toBe('2026-01-01T00:00:00.000Z');
  });
});
