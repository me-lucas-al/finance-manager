export function ChartEmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-[240px] items-center justify-center text-xs text-zinc-500 font-sans">
      {message}
    </div>
  );
}
