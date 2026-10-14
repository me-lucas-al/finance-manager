export function ToolCallIndicator() {
  return (
    <div className="my-3 rounded-xl bg-black/40 border border-white/5 p-3 text-xs text-zinc-400 flex items-center gap-3 w-max">
      <div className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500" />
      </div>
      Acessando seus dados financeiros...
    </div>
  );
}
