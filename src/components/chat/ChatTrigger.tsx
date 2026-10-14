import { Sparkles } from 'lucide-react';
import { SheetTrigger } from '@/components/ui/sheet';

export function ChatTrigger() {
  return (
    <SheetTrigger
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black border border-white/10 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] active:scale-95 group overflow-hidden"
      aria-label="Abrir assistente financeiro"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Sparkles className="h-6 w-6 text-zinc-300 group-hover:text-white transition-colors" />
    </SheetTrigger>
  );
}
