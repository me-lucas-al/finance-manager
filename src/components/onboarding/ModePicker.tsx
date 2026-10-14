import { Landmark, PencilLine } from 'lucide-react';
import type { DataMode } from '@/modules/onboarding/application/choose-data-mode';
import { ComparisonTable } from './ComparisonTable';
import { ModeCard } from './ModeCard';
import { SwitchModeWarning } from './SwitchModeWarning';

type ModePickerProps = {
  selected: DataMode | null;
  onSelect: (mode: DataMode) => void;
  showWarning: boolean;
  acknowledged: boolean;
  onAcknowledge: (acknowledged: boolean) => void;
  error: string | null;
};

export function ModePicker({ selected, onSelect, showWarning, acknowledged, onAcknowledge, error }: ModePickerProps) {
  return (
    <div className="space-y-4">
      <ComparisonTable />
      <div className="flex gap-3">
        <ModeCard
          icon={PencilLine}
          title="Manual"
          tagline="Eu mesmo registro"
          selected={selected === 'manual'}
          onSelect={() => onSelect('manual')}
          testId="mode-manual"
        />
        <ModeCard
          icon={Landmark}
          title="Pluggy"
          tagline="Importar do banco"
          selected={selected === 'pluggy'}
          onSelect={() => onSelect('pluggy')}
          testId="mode-pluggy"
        />
      </div>
      {showWarning ? <SwitchModeWarning acknowledged={acknowledged} onAcknowledge={onAcknowledge} /> : null}
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
