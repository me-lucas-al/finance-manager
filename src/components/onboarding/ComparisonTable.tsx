const COMPARISON_ROWS = [
  { label: 'Como os dados entram', manual: 'Você digita (app ou Telegram)', pluggy: 'Importados do seu banco' },
  { label: 'Esforço no dia a dia', manual: 'Um pouco, a cada gasto', pluggy: 'Quase nenhum' },
  { label: 'Precisa de login do banco', manual: 'Não', pluggy: 'Sim (conexão segura Open Finance)' },
  { label: 'Controle sobre cada lançamento', manual: 'Total', pluggy: 'Automático' },
];

const ROW_GRID = 'grid grid-cols-[1.1fr_1fr_1fr]';

export function ComparisonTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 text-left text-xs">
      <div className={`${ROW_GRID} bg-zinc-900 px-3 py-2 font-semibold text-zinc-300`}>
        <span />
        <span>✍️ Manual</span>
        <span>🏦 Pluggy</span>
      </div>
      {COMPARISON_ROWS.map((row) => (
        <div key={row.label} className={`${ROW_GRID} gap-2 border-t border-zinc-800 px-3 py-2 text-zinc-400`}>
          <span className="font-medium text-zinc-300">{row.label}</span>
          <span>{row.manual}</span>
          <span>{row.pluggy}</span>
        </div>
      ))}
    </div>
  );
}
