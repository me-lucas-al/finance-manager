import { ToolDefinition } from '../../domain/models/language-model';
import { LedgerService } from '@/modules/finance/application/services/ledger-service';
import { GoalRepository } from '@/modules/open-finance/domain/repositories/goal-repository';
import { SavingsGoalRepository } from '@/modules/open-finance/domain/repositories/savings-goal-repository';
import { AssistantMemoryRepository } from '../../domain/repositories/assistant-memory-repository';
import { RegisterManualEntryUseCase } from '@/modules/finance/application/use-cases/register-manual-entry';
import { UpdateEntryUseCase } from '@/modules/finance/application/use-cases/update-entry';
import { DeleteEntryUseCase } from '@/modules/finance/application/use-cases/delete-entry';
import { buildAdvisorQueryTools } from './advisor-query-tools';
import { buildAdvisorBalanceTools } from './advisor-balance-tools';
import { buildAdvisorGoalTools, GoalsMessageUpdater } from './advisor-goal-tools';
import { buildAdvisorEntryTools } from './advisor-entry-tools';
import { buildAdvisorActionTools } from './advisor-action-tools';

export type AdvisorToolCollaborators = {
  ledger: LedgerService;
  goalRepo: GoalRepository;
  savingsGoalRepo: SavingsGoalRepository;
  memoryRepo: AssistantMemoryRepository;
  registerEntry: RegisterManualEntryUseCase;
  updateEntry: UpdateEntryUseCase;
  deleteEntry: DeleteEntryUseCase;
  goalsUpdater: GoalsMessageUpdater;
  listCategories: (userId: string) => Promise<string[]>;
};

export type ToolDeps = AdvisorToolCollaborators & { userId: string };

export type AdvisorToolsFactory = (userId: string) => ToolDefinition[];

export function buildAdvisorTools(deps: ToolDeps): ToolDefinition[] {
  return [
    ...buildAdvisorQueryTools(deps),
    ...buildAdvisorBalanceTools(deps),
    ...buildAdvisorGoalTools(deps),
    ...buildAdvisorEntryTools(deps),
    ...buildAdvisorActionTools(deps),
  ];
}

export function createAdvisorToolsFactory(collaborators: AdvisorToolCollaborators): AdvisorToolsFactory {
  return (userId) => buildAdvisorTools({ ...collaborators, userId });
}
