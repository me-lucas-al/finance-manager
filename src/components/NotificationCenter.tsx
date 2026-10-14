'use client';

import { useState, useTransition } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { markAllNotificationsAsRead, markNotificationAsRead, clearAllNotifications } from '@/app/actions/notifications';
import type { UserNotification } from '@/types/notification';
import { NotificationBellTrigger } from './notifications/NotificationBellTrigger';
import { NotificationFooter } from './notifications/NotificationFooter';
import { NotificationItem } from './notifications/NotificationItem';

export function NotificationCenter({ initialNotifications }: { initialNotifications: UserNotification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [, startTransition] = useTransition();
  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  const markAsRead = (id: string) => {
    setNotifications((previous) =>
      previous.map((notification) => (notification.id === id ? { ...notification, readAt: new Date() } : notification))
    );
    startTransition(() => markNotificationAsRead(id));
  };

  const markAllAsRead = () => {
    setNotifications((previous) => previous.map((notification) => ({ ...notification, readAt: new Date() })));
    startTransition(() => markAllNotificationsAsRead());
  };

  const clearAll = () => {
    setNotifications([]);
    startTransition(() => clearAllNotifications());
  };

  return (
    <DropdownMenu>
      <NotificationBellTrigger unreadCount={unreadCount} />
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex justify-between items-center">
            <span>Notificações</span>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto p-1 text-xs">
                <Check className="h-3 w-3 mr-1" /> Marcar todas como lidas
              </Button>
            )}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">Nenhuma notificação.</div>
          )}
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} onRead={markAsRead} />
          ))}
        </ScrollArea>
        <DropdownMenuSeparator />
        <NotificationFooter onClear={clearAll} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
