import { Bot } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

export function AssistantAvatar() {
  return (
    <Avatar className="h-8 w-8 shrink-0">
      <div className="flex h-full w-full items-center justify-center bg-blue-600 text-white">
        <Bot className="h-4 w-4" />
      </div>
    </Avatar>
  );
}
