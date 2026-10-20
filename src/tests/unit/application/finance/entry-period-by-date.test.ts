import { describe, it, expect } from 'vitest';
import { dateAtNoon } from '@/lib/month';
import { buildFakeEntryServices } from '@/tests/fakes/build-fake-entry-services';
import { noopCardLinkValidator } from '@/tests/fakes/noop-card-link-validator';
import { UpdateEntryUseCase } from '@/modules/finance/application/use-cases/update-entry';
import { ClassifyNecessityService } from '@/modules/finance/application/services/classify-necessity-service';
import { FakeLanguageModel } from '@/tests/fakes/fake-language-model';
import { FakePeriodRepository } from '@/tests/fakes/fake-period-repository';
import { FakeSettingRepository } from '@/tests/fakes/fake-setting-repository';
import { ResolveCurrentPeriodUseCase } from '@/modules/periods/application/use-cases/resolve-current-period';

describe('ResolveCurrentPeriodUseCase.forDate', () => {
  it('returns the period that contains the date and falls back to the open one', async () => {
    const repo = new FakePeriodRepository();
    const closed = await repo.create({
      userId: 'u',
      startDate: new Date('2026-08-15T03:00:00Z'),
      endDate: new Date('2026-09-15T02:59:59Z'),
      status: 'CLOSED',
    });
    const open = await repo.create({
      userId: 'u',
      startDate: new Date('2026-09-15T03:00:00Z'),
      endDate: new Date('2026-10-15T02:59:59Z'),
      status: 'OPEN',
    });
    const resolver = new ResolveCurrentPeriodUseCase(repo, new FakeSettingRepository());

    expect((await resolver.forDate('u', dateAtNoon('2026-08-20'))).id).toBe(closed.id);
    expect((await resolver.forDate('u', dateAtNoon('2026-09-20'))).id).toBe(open.id);
    expect((await resolver.forDate('u', dateAtNoon('2025-01-01'))).id).toBe(open.id);
  });
});

describe('expense period follows its date', () => {
  it('stamps a new expense with a period', async () => {
    const { registerEntry, transactionRepo } = buildFakeEntryServices();

    await registerEntry.execute('user-1', { type: 'expense', category: 'Lazer', description: 'Cinema', amount: 40 });

    const [stored] = await transactionRepo.findAllByUserId('user-1');
    expect(stored.periodId).toEqual(expect.any(String));
  });

  it('moves the expense to the period of the new date', async () => {
    const services = buildFakeEntryServices();
    const periods = new FakePeriodRepository();
    const older = await periods.create({
      userId: 'user-1',
      startDate: new Date('2026-01-15T03:00:00Z'),
      endDate: new Date('2026-02-15T02:59:59Z'),
      status: 'CLOSED',
    });
    const update = new UpdateEntryUseCase(
      services.transactionRepo,
      services.incomeRepo,
      services.investmentRepo,
      services.guard,
      new ClassifyNecessityService(services.transactionRepo, new FakeLanguageModel()),
      services.notifier,
      noopCardLinkValidator,
      new ResolveCurrentPeriodUseCase(periods, new FakeSettingRepository()),
    );
    await services.registerEntry.execute('user-1', { type: 'expense', category: 'Lazer', description: 'Cinema', amount: 40 });
    const [created] = await services.transactionRepo.findAllByUserId('user-1');

    await update.execute('user-1', { kind: 'expense', id: created.id }, { date: '2026-01-20', necessity: 'superfluo' });

    const moved = await services.transactionRepo.findById(created.id);
    expect(moved?.periodId).toBe(older.id);
    expect(moved?.referenceMonth).toBe('2026-01');
  });
});
