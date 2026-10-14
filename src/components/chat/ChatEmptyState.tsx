export function ChatEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center mt-20 text-zinc-500 space-y-4">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-white/5 flex items-center justify-center">
        <span className="text-2xl opacity-50">✨</span>
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm text-zinc-300 font-medium">Olá! Sou sua inteligência financeira.</p>
        <p className="text-xs">Pergunte sobre seus saldos, transações ou insights de gastos.</p>
      </div>
    </div>
  );
}
