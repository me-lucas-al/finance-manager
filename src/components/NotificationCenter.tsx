'use client';

import { useState } from 'react';
import { Bell, Check, Trash2, Settings } from 'lucide-react';
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

// Mock data until integrated with backend
const MOCK_NOTIFICATIONS = [
  { id: '1', type: 'EXPENSE_WARNING', title: 'Aviso de Gastos', message: 'Você já utilizou 76% da sua renda em gastos.', readAt: null, createdAt: new Date() },
  { id: '2', type: 'EXPENSE_LIMIT_REACHED', title: 'Limite Atingido', message: 'Restam R$ 120 até atingir o limite.', readAt: null, createdAt: new Date(Date.now() - 3600000) },
  { id: '3', type: 'PERIOD_CLOSED', title: 'Período Fechado', message: 'O período foi fechado com sucesso.', readAt: new Date(), createdAt: new Date(Date.now() - 86400000) },
];

export function NotificationCenter() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date() } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date() })));
  };

  const clearAll = () => {
    setNotifications([]);
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
          <Button variant="ghost" size="sm" className="text-xs">
            <Settings className="h-3 w-3 mr-1" /> Configurações
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
