import type { DataMode } from '@/modules/onboarding/application/choose-data-mode';

export const DATA_MODE_LABELS: Record<DataMode, { name: string; description: string }> = {
  manual: { name: 'Manual', description: 'Você registra receitas, despesas e investimentos.' },
  pluggy: { name: 'Pluggy (Open Finance)', description: 'Os dados são importados do seu banco.' },
};

export function oppositeMode(mode: DataMode): DataMode {
  return mode === 'manual' ? 'pluggy' : 'manual';
}
