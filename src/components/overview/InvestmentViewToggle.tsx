export type InvestmentView = 'classes' | 'instituicoes';

const VIEW_OPTIONS: Array<{ view: InvestmentView; label: string }> = [
  { view: 'classes', label: 'Classes' },
  { view: 'instituicoes', label: 'Instituições' },
];

interface InvestmentViewToggleProps {
  activeView: InvestmentView;
  onChange: (view: InvestmentView) => void;
}

export function InvestmentViewToggle({ activeView, onChange }: InvestmentViewToggleProps) {
  return (
    <div className="flex items-center p-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
      {VIEW_OPTIONS.map(({ view, label }) => (
        <button
          key={view}
          type="button"
          onClick={() => onChange(view)}
          className={`text-xs px-2.5 py-0.5 rounded-md font-medium transition-colors ${
            activeView === view ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
