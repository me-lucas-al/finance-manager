import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function NotificationBellTrigger({ unreadCount }: { unreadCount: number }) {
  return (
    <DropdownMenuTrigger
      render={
        <Button
          variant="ghost"
          size="icon"
          className="relative text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
        />
      }
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount}
        </Badge>
      )}
    </DropdownMenuTrigger>
  );
}
