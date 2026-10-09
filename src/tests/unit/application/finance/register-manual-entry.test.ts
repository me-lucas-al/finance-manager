import { describe, it, expect, beforeEach } from 'vitest';
import { RegisterManualEntryUseCase } from '@/modules/finance/application/use-cases/register-manual-entry';
import { FakeTransactionRepository } from '../open-finance/fake-transaction-repository';
import { FakeIncomeRepository } from '@/tests/fakes/fake-income-repository';
import { FakeInvestmentRepository } from '@/tests/fakes/fake-investment-repository';
import { ResolveCurrentPeriodUseCase } from '@/modules/periods/application/use-cases/resolve-current-period';
import { FakePeriodRepository } from '../periods/fake-period-repository';
import { FakeSettingRepository } from '../users/fake-setting-repository';
import { ClassifyNecessityService } from '@/modules/finance/application/services/classify-necessity-service';
import { FakeLanguageModel } from '@/tests/fakes/fake-language-model';

describe('RegisterManualEntryUseCase', () => {
  let transactionRepo: FakeTransactionRepository;
  let incomeRepo: FakeIncomeRepository;
  let investmentRepo: FakeInvestmentRepository;
  let resolvePeriod: ResolveCurrentPeriodUseCase;
  let classifyNecessity: ClassifyNecessityService;
  let useCase: RegisterManualEntryUseCase;

  beforeEach(() => {
    transactionRepo = new FakeTransactionRepository();
    incomeRepo = new FakeIncomeRepository();
    investmentRepo = new FakeInvestmentRepository();
    resolvePeriod = new ResolveCurrentPeriodUseCase(new FakePeriodRepository(), new FakeSettingRepository());
    classifyNecessity = new ClassifyNecessityService(transactionRepo, new FakeLanguageModel());
    useCase = new RegisterManualEntryUseCase(
      transactionRepo,
      incomeRepo,
      investmentRepo,
      resolvePeriod,
      classifyNecessity
    );
  });

  it('registers manual expense with classified necessity', async () => {
    const result = await useCase.execute('user-1', {
      type: 'expense',
      category: 'Mercado',
      description: 'Compras semana',
      amount: 150,
    });

    expect(result.type).toBe('expense');
    expect(result.amount).toBe(150);
    const txs = await transactionRepo.findAllByUserId('user-1');
    expect(txs).toHaveLength(1);
    expect(txs[0].source).toBe('manual');
    expect(txs[0].amount).toBe(150);
    expect(txs[0].category).toBe('Mercado');
  });

  it('registers manual income in incomes repository', async () => {
    const result = await useCase.execute('user-1', {
      type: 'income',
      category: 'Salário',
      description: 'Empresa X',
      amount: 5000,
    });

    expect(result.type).toBe('income');
    expect(incomeRepo.items).toHaveLength(1);
    expect(incomeRepo.items[0].description).toBe('Empresa X');
    expect(incomeRepo.items[0].amount).toBe('5000');
  });

  it('registers manual investment in investments repository', async () => {
    const result = await useCase.execute('user-1', {
      type: 'investment',
      category: 'Tesouro Selic',
      description: 'Aporte mensal',
      amount: 500,
    });

    expect(result.type).toBe('investment');
    expect(investmentRepo.items).toHaveLength(1);
    expect(investmentRepo.items[0].type).toBe('Tesouro Selic');
    expect(investmentRepo.items[0].amount).toBe('500');
  });
});
