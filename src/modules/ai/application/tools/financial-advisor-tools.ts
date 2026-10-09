import { ToolDefinition } from '../../domain/models/language-model';
import { TransactionRepository } from '@/modules/open-finance/domain/repositories/transaction-repository';
import { GoalRepository } from '@/modules/open-finance/domain/repositories/goal-repository';
import { AssistantMemoryRepository } from '../../domain/repositories/assistant-memory-repository';
import { RegisterManualEntryUseCase } from '@/modules/finance/application/use-cases/register-manual-entry';
import { buildAdvisorQueryTools } from './advisor-query-tools';
import { buildAdvisorActionTools } from './advisor-action-tools';

export type ToolDeps = {
  userId: string;
  transactionRepo: TransactionRepository;
  goalRepo: GoalRepository;
  memoryRepo: AssistantMemoryRepository;
  registerEntry: RegisterManualEntryUseCase;
};

export function buildAdvisorTools(deps: ToolDeps): ToolDefinition[] {
  return [
    ...buildAdvisorQueryTools({
      userId: deps.userId,
      transactionRepo: deps.transactionRepo,
    }),
    ...buildAdvisorActionTools({
      userId: deps.userId,
      goalRepo: deps.goalRepo,
      memoryRepo: deps.memoryRepo,
      registerEntry: deps.registerEntry,
    }),
  ];
}
