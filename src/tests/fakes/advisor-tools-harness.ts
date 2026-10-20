import { vi } from 'vitest';
import { buildAdvisorTools } from '@/modules/ai/application/tools/financial-advisor-tools';
import { PortfolioService } from '@/modules/finance/application/services/portfolio-service';
import type { RegisterManualEntryUseCase } from '@/modules/finance/application/use-cases/register-manual-entry';
import type { UpdateEntryUseCase } from '@/modules/finance/application/use-cases/update-entry';
import type { DeleteEntryUseCase } from '@/modules/finance/application/use-cases/delete-entry';
import type { AdvisorFixedEntryServices } from '@/modules/ai/application/tools/advisor-fixed-types';
import { DeletionConfirmationService } from '@/modules/ai/application/services/deletion-confirmation-service';
import type { AdvisorCreditCardServices } from '@/modules/ai/application/tools/advisor-card-types';
import { fakePortfolioSource } from './fake-portfolio-source';
import { createFakePeriodLedger } from './fake-period-ledger';
import { FakeGoalRepository } from './fake-goal-repository';
import { FakeSavingsGoalRepository } from './fake-savings-goal-repository';
import { FakeAssistantMemoryRepository } from './fake-assistant-memory-repository';

const stubUseCase = (result: unknown) => ({ execute: vi.fn().mockResolvedValue(result) });

export function createAdvisorToolsHarness() {
  const goalRepo = new FakeGoalRepository();
  const memoryRepo = new FakeAssistantMemoryRepository();
  const registerEntry = stubUseCase({ success: true });
  const updateEntry = stubUseCase(undefined);
  const deleteEntry = stubUseCase(undefined);
  const goalsUpdater = stubUseCase('ok');
  const deletion = new DeletionConfirmationService('test-secret');
  const creditCards = {
    readDataMode: vi.fn().mockResolvedValue('manual'),
    list: stubUseCase([]),
    create: stubUseCase({ id: 'card-1' }),
    update: stubUseCase(undefined),
    remove: stubUseCase(undefined),
  };

  const tools = buildAdvisorTools({
    userId: 'user-1',
    periodLedger: createFakePeriodLedger().service,
    portfolio: new PortfolioService(fakePortfolioSource()),
    goalRepo,
    savingsGoalRepo: new FakeSavingsGoalRepository(),
    memoryRepo,
    registerEntry: registerEntry as unknown as RegisterManualEntryUseCase,
    updateEntry: updateEntry as unknown as UpdateEntryUseCase,
    deleteEntry: deleteEntry as unknown as DeleteEntryUseCase,
    fixedEntries: {} as unknown as AdvisorFixedEntryServices,
    creditCards: creditCards as unknown as AdvisorCreditCardServices,
    deletion,
    turnId: 'turn-2',
    goalsUpdater,
    listCategories: async () => ['Mercado', 'Lazer'],
  });

  const run = (name: string, args: Record<string, unknown> = {}) =>
    tools.find((tool) => tool.name === name)!.execute(args);

  return { run, tools, creditCards, goalRepo, memoryRepo, registerEntry, updateEntry, deleteEntry, goalsUpdater, deletion };
}
