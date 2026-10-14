import Link from 'next/link';
import { Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotificationFooter({ onClear }: { onClear: () => void }) {
  return (
    <div className="p-2 flex justify-between">
      <Button variant="ghost" size="sm" onClick={onClear} className="text-xs text-destructive">
        <Trash2 className="h-3 w-3 mr-1" /> Limpar
      </Button>
      <Button variant="ghost" size="sm" className="text-xs" render={<Link href="/settings" />}>
        <Settings className="h-3 w-3 mr-1" /> Configurações
      </Button>
    </div>
  );
}
