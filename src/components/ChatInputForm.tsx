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
    <div className="p-4 border-t border-zinc-800/80 bg-[#09090b]">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Pergunte ou defina uma meta..."
          className="flex-1 bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-blue-600"
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
