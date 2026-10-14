type SwitchModeWarningProps = {
  acknowledged: boolean;
  onAcknowledge: (acknowledged: boolean) => void;
};

export function SwitchModeWarning({ acknowledged, onAcknowledge }: SwitchModeWarningProps) {
  return (
    <label
      className="flex cursor-pointer items-start gap-2 rounded-xl border border-red-900/60 bg-red-950/30 p-3 text-left text-xs text-red-300"
      data-testid="switch-mode-warning"
    >
      <input
        type="checkbox"
        className="mt-0.5"
        checked={acknowledged}
        onChange={(event) => onAcknowledge(event.target.checked)}
      />
      <span>
        <strong>Atenção:</strong> ao trocar de modo, todos os dados do modo atual (receitas, despesas, investimentos
        e bancos conectados) serão apagados e você recomeça do zero. Entendo e quero continuar.
      </span>
    </label>
  );
}
