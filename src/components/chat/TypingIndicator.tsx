import { MessageAvatar } from './MessageAvatar';

export function TypingIndicator() {
  return (
    <div className="flex gap-4 text-sm flex-row">
      <MessageAvatar isAssistant />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-zinc-500">Finance AI</span>
        </div>
        <div className="flex items-center gap-1.5 h-6">
          <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}
