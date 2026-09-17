import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputFormProps {
  input: string;
  isLoading: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function ChatInputForm({ input, isLoading, handleInputChange, handleSubmit }: ChatInputFormProps) {
  return (
    <div className="p-4 bg-[#09090b] border-t border-zinc-800/80">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Como posso te ajudar hoje?"
          className="flex-1 rounded-full bg-zinc-900 border-zinc-800 py-6 pl-5 pr-14 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-purple-500/50 focus-visible:border-purple-500 shadow-inner"
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isLoading || !input.trim()}
          className="absolute right-1.5 h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white shrink-0 shadow-md transition-all hover:scale-105 active:scale-95 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 disabled:scale-100 disabled:shadow-none"
        >
          <Send className="h-4 w-4 ml-0.5" />
        </Button>
      </form>
    </div>
  );
}
