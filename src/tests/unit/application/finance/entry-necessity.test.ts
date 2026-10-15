import { describe, it, expect, beforeEach } from 'vitest';
import { RegisterManualEntryUseCase } from '@/modules/finance/application/use-cases/register-manual-entry';
import { UpdateEntryUseCase } from '@/modules/finance/application/use-cases/update-entry';
import { OwnedEntryGuard } from '@/modules/finance/application/services/owned-entry-guard';
import { ClassifyNecessityService } from '@/modules/finance/application/services/classify-necessity-service';
import { ExpensePatternAnalyzer } from '@/modules/finance/application/services/expense-pattern-analyzer';
import { ResolveCurrentPeriodUseCase } from '@/modules/periods/application/use-cases/resolve-current-period';
import { noopEntryChangeNotifier } from '@/modules/finance/domain/ports/entry-change-notifier';
import { FakeTransactionRepository } from '@/tests/fakes/fake-transaction-repository';
import { FakePeriodRepository } from '@/tests/fakes/fake-period-repository';
import { FakeSettingRepository } from '@/tests/fakes/fake-setting-repository';
import { FakeIncomeRepository } from '@/tests/fakes/fake-income-repository';
import { FakeInvestmentRepository } from '@/tests/fakes/fake-investment-repository';
import { FakeLanguageModel } from '@/tests/fakes/fake-language-model';

describe('informed necessity on expenses', () => {
  let transactionRepo: FakeTransactionRepository;
  let register: RegisterManualEntryUseCase;
  let update: UpdateEntryUseCase;

  beforeEach(() => {
    transactionRepo = new FakeTransactionRepository();
    const incomeRepo = new FakeIncomeRepository();
    const investmentRepo = new FakeInvestmentRepository();
    const language = new FakeLanguageModel();
    language.nextStructuredResponse = { necessity: 'superfluo' };
    const classify = new ClassifyNecessityService(transactionRepo, language);
    register = new RegisterManualEntryUseCase(
      transactionRepo,
      incomeRepo,
      investmentRepo,
      new ResolveCurrentPeriodUseCase(new FakePeriodRepository(), new FakeSettingRepository()),
      classify,
      new ExpensePatternAnalyzer(transactionRepo),
      noopEntryChangeNotifier
    );
    const guard = new OwnedEntryGuard(transactionRepo, incomeRepo, investmentRepo);
    update = new UpdateEntryUseCase(transactionRepo, incomeRepo, investmentRepo, guard, classify, noopEntryChangeNotifier);
  });

  const expense = { type: 'expense' as const, category: 'Lazer', description: 'Cinema', amount: 40 };

  it('classifies automatically when necessity is not informed', async () => {
    const result = await register.execute('user-1', expense);

    expect(result.necessity).toBe('superfluo');
  });

  it('keeps the informed necessity instead of classifying', async () => {
    const result = await register.execute('user-1', { ...expense, necessity: 'essencial' });

    expect(result.necessity).toBe('essencial');
    const [stored] = await transactionRepo.findAllByUserId('user-1');
    expect(stored.necessity).toBe('essencial');
  });

  it('applies informed necessity on update even when category changes', async () => {
    await register.execute('user-1', expense);
    const [stored] = await transactionRepo.findAllByUserId('user-1');

    await update.execute('user-1', { kind: 'expense', id: stored.id }, { category: 'Saúde', necessity: 'importante' });

    expect((await transactionRepo.findById(stored.id))?.necessity).toBe('importante');
  });

  it('rejects an unknown necessity value', async () => {
    await register.execute('user-1', expense);
    const [stored] = await transactionRepo.findAllByUserId('user-1');
    const ref = { kind: 'expense' as const, id: stored.id };

    await expect(update.execute('user-1', ref, { necessity: 'luxo' as never })).rejects.toThrow('Necessidade inválida');
  });
});
