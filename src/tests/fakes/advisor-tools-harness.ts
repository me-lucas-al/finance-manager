import { vi } from 'vitest';
import { buildAdvisorTools } from '@/modules/ai/application/tools/financial-advisor-tools';
import { PortfolioService } from '@/modules/finance/application/services/portfolio-service';
import { LedgerService } from '@/modules/finance/application/services/ledger-service';
import type { RegisterManualEntryUseCase } from '@/modules/finance/application/use-cases/register-manual-entry';
import type { UpdateEntryUseCase } from '@/modules/finance/application/use-cases/update-entry';
import type { DeleteEntryUseCase } from '@/modules/finance/application/use-cases/delete-entry';
import type { AdvisorFixedEntryServices } from '@/modules/ai/application/tools/advisor-fixed-types';
import { DeletionConfirmationService } from '@/modules/ai/application/services/deletion-confirmation-service';
import { fakePortfolioSource } from './fake-portfolio-source';
import { sampleLedgerSource } from './fake-ledger-source';
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

  const tools = buildAdvisorTools({
    userId: 'user-1',
    ledger: new LedgerService(sampleLedgerSource),
    portfolio: new PortfolioService(fakePortfolioSource()),
    goalRepo,
    savingsGoalRepo: new FakeSavingsGoalRepository(),
    memoryRepo,
    registerEntry: registerEntry as unknown as RegisterManualEntryUseCase,
    updateEntry: updateEntry as unknown as UpdateEntryUseCase,
    deleteEntry: deleteEntry as unknown as DeleteEntryUseCase,
    fixedEntries: {} as unknown as AdvisorFixedEntryServices,
    deletion,
    turnId: 'turn-2',
    goalsUpdater,
    listCategories: async () => ['Mercado', 'Lazer'],
  });

  const run = (name: string, args: Record<string, unknown> = {}) =>
    tools.find((tool) => tool.name === name)!.execute(args);

  return { run, tools, goalRepo, memoryRepo, registerEntry, updateEntry, deleteEntry, goalsUpdater, deletion };
}
