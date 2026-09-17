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
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
      <form onSubmit={handleSubmit} className="relative flex items-center bg-black/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-inner">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Como posso te ajudar hoje?"
          className="flex-1 bg-transparent border-0 py-6 pl-5 pr-14 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isLoading || !input.trim()}
          className="absolute right-2 h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white shrink-0 transition-all active:scale-95 disabled:bg-transparent disabled:text-zinc-600"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
