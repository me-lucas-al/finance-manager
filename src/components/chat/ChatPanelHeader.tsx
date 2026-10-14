import { Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';

type ChatPanelHeaderProps = {
  canClear: boolean;
  onClear: () => void;
};

export function ChatPanelHeader({ canClear, onClear }: ChatPanelHeaderProps) {
  return (
    <SheetHeader className="p-5 border-b border-white/5 shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-white/10 text-white shadow-inner">
            <Sparkles className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <SheetTitle className="text-zinc-100 text-xl font-light tracking-tight">Finance AI</SheetTitle>
            <p className="text-sm text-zinc-500 font-medium tracking-wide">ASSISTENTE INTELIGENTE</p>
          </div>
        </div>

        {canClear && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            aria-label="Limpar conversa"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </SheetHeader>
  );
}
