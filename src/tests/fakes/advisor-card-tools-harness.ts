import { vi } from 'vitest';
import { buildAdvisorCardTools } from '@/modules/ai/application/tools/advisor-card-tools';
import type { AdvisorCreditCardServices } from '@/modules/ai/application/tools/advisor-card-types';
import { DeletionConfirmationService } from '@/modules/ai/application/services/deletion-confirmation-service';

type Mode = 'manual' | 'pluggy' | null;

export function createCardToolsHarness() {
  const state: { mode: Mode } = { mode: 'manual' };
  const services = {
    list: { execute: vi.fn() },
    create: { execute: vi.fn() },
    update: { execute: vi.fn() },
    remove: { execute: vi.fn() },
  };

  const run = (name: string, args: Record<string, unknown> = {}, turnId = 'turn-2') => {
    const tools = buildAdvisorCardTools({
      userId: 'user-1',
      turnId,
      creditCards: { readDataMode: async () => state.mode, ...services } as unknown as AdvisorCreditCardServices,
      deletion: new DeletionConfirmationService('test-secret'),
    });
    return tools.find((tool) => tool.name === name)!.execute(args);
  };

  return { run, services, setMode: (mode: Mode) => void (state.mode = mode) };
}
