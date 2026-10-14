export function MessageAvatar({ isAssistant }: { isAssistant: boolean }) {
  if (isAssistant) {
    return (
      <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center mt-0.5">
        <span className="text-[10px]">AI</span>
      </div>
    );
  }

  return (
    <div className="h-8 w-8 shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mt-0.5">
      <span className="text-zinc-400 text-[10px]">VC</span>
    </div>
  );
}
