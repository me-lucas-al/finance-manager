type StepProgressProps = {
  current: number;
  total: number;
  title: string | undefined;
  percent: number;
};

export function StepProgress({ current, total, title, percent }: StepProgressProps) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between text-xs font-medium text-zinc-400">
        <span>
          Passo {current + 1} de {total}
        </span>
        <span className="text-zinc-500">{title}</span>
      </div>
      <div
        className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current + 1}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </>
  );
}
