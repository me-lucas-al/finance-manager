import { ToolDefinition } from '../../domain/models/language-model';
import { LedgerService } from '@/modules/finance/application/services/ledger-service';
import { PortfolioService } from '@/modules/finance/application/services/portfolio-service';
import { GoalRepository } from '@/modules/open-finance/domain/repositories/goal-repository';
import { SavingsGoalRepository } from '@/modules/open-finance/domain/repositories/savings-goal-repository';
import { AssistantMemoryRepository } from '../../domain/repositories/assistant-memory-repository';
import { RegisterManualEntryUseCase } from '@/modules/finance/application/use-cases/register-manual-entry';
import { UpdateEntryUseCase } from '@/modules/finance/application/use-cases/update-entry';
import { DeleteEntryUseCase } from '@/modules/finance/application/use-cases/delete-entry';
import { buildAdvisorQueryTools } from './advisor-query-tools';
import { buildAdvisorBalanceTools } from './advisor-balance-tools';
import { buildAdvisorGoalTools, GoalsMessageUpdater } from './advisor-goal-tools';
import { DeletionConfirmationService } from '../services/deletion-confirmation-service';
import { buildAdvisorEntryTools } from './advisor-entry-tools';
import { buildAdvisorActionTools } from './advisor-action-tools';

export type AdvisorToolCollaborators = {
  ledger: LedgerService;
  portfolio: PortfolioService;
  goalRepo: GoalRepository;
  savingsGoalRepo: SavingsGoalRepository;
  memoryRepo: AssistantMemoryRepository;
  registerEntry: RegisterManualEntryUseCase;
  updateEntry: UpdateEntryUseCase;
  deleteEntry: DeleteEntryUseCase;
  deletion: DeletionConfirmationService;
  goalsUpdater: GoalsMessageUpdater;
  listCategories: (userId: string) => Promise<string[]>;
};

export type AdvisorToolContext = { userId: string; turnId: string };

export type ToolDeps = AdvisorToolCollaborators & AdvisorToolContext;

export type AdvisorToolsFactory = (context: AdvisorToolContext) => ToolDefinition[];

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
  return (context) => buildAdvisorTools({ ...collaborators, ...context });
}
