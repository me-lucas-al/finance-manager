'use client';

import { useState, useTransition } from 'react';
import { Bell, Check, Trash2, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { markAllNotificationsAsRead, markNotificationAsRead, clearAllNotifications } from '@/app/actions/notifications';

interface Notification {
  id: string;
  title: string;
  message: string;
  readAt: Date | null;
  createdAt: Date;
}

export function NotificationCenter({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [, startTransition] = useTransition();
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date() } : n)));
    startTransition(() => markNotificationAsRead(id));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date() })));
    startTransition(() => markAllNotificationsAsRead());
  };

  const clearAll = () => {
    setNotifications([]);
    startTransition(() => clearAllNotifications());
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative" />}>
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
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto p-1 text-xs">
              <Check className="h-3 w-3 mr-1" /> Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhuma notificação.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex flex-col p-3 border-b cursor-pointer hover:bg-slate-50 transition-colors ${!notif.readAt ? 'bg-blue-50' : ''}`}
                onClick={() => markAsRead(notif.id)}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm">{notif.title}</span>
                  {!notif.readAt && <div className="h-2 w-2 bg-blue-600 rounded-full"></div>}
                </div>
                <p className="text-xs text-muted-foreground">{notif.message}</p>
                <span className="text-[10px] text-muted-foreground mt-2">
                  {new Date(notif.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <div className="p-2 flex justify-between">
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs text-destructive">
            <Trash2 className="h-3 w-3 mr-1" /> Limpar
          </Button>
          <Button variant="ghost" size="sm" className="text-xs" render={<Link href="/settings" />}>
            <Settings className="h-3 w-3 mr-1" /> Configurações
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
