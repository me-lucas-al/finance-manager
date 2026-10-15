import { reportFailure } from './advisor-failure-reporter';
import type { AdvisorCreditCardServices } from './advisor-card-types';

export const PLUGGY_MODE_REFUSAL =
  'No modo banco (Pluggy) os cartões vêm direto do banco conectado e não podem ser cadastrados, editados, excluídos nem escolhidos manualmente. Só quem usa o modo manual controla cartões por aqui.';

type ManualModeContext = { userId: string; creditCards: Pick<AdvisorCreditCardServices, 'readDataMode'> };

export async function isManualMode({ userId, creditCards }: ManualModeContext): Promise<boolean> {
  return (await creditCards.readDataMode(userId)) === 'manual';
}

export async function runInManualMode<T>(context: ManualModeContext, action: () => Promise<T>) {
  if (!(await isManualMode(context))) return { erro: PLUGGY_MODE_REFUSAL };
  return reportFailure(action);
}
