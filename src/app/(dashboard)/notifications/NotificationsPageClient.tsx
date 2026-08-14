'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getNotifications, markAsRead, markAllAsRead } from '@/app/actions/notifications';
import { Check, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

type Notification = {
  id: string;
  title: string;
  message: string;
  readAt: Date | null;
  createdAt: Date;
  type: string;
};

export function NotificationsPageClient() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchNotifications = async () => {
    setLoading(true);
    const result = await getNotifications({ 
      page, 
      limit: 10, 
      unreadOnly: filter === 'unread' 
    });
    if (result.success && result.data) {
      setNotifications(result.data as Notification[]);
      setTotalPages(result.totalPages || 1);
      setTotal(result.total || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
  }, [page, filter]);

  const handleMarkAsRead = async (id: string) => {
    const result = await markAsRead(id);
    if (result.success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, readAt: new Date() } : n));
      if (filter === 'unread') {
        // Optimistically remove from list if filtering by unread
        setNotifications(prev => prev.filter(n => n.id !== id));
        setTotal(prev => Math.max(0, prev - 1));
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllAsRead();
    if (result.success) {
      if (filter === 'unread') {
        setNotifications([]);
        setTotal(0);
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, readAt: new Date() })));
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notificações</h1>
          <p className="text-sm text-gray-500">Você tem {total} notificações {filter === 'unread' ? 'não lidas' : ''}</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex bg-gray-100 p-1 rounded-md">
            <button
              onClick={() => { setFilter('all'); setPage(1); }}
              className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${filter === 'all' ? 'bg-white shadow-xs text-black' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Todas
            </button>
            <button
              onClick={() => { setFilter('unread'); setPage(1); }}
              className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${filter === 'unread' ? 'bg-white shadow-xs text-black' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Não Lidas
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} disabled={notifications.length === 0 || !notifications.some(n => !n.readAt)}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Marcar todas como lidas
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando notificações...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Tudo limpo por aqui!</h3>
            <p className="text-gray-500">Nenhuma notificação encontrada com os filtros atuais.</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 flex gap-4 transition-colors ${!notification.readAt ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-medium ${!notification.readAt ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className={`text-sm ${!notification.readAt ? 'text-gray-700' : 'text-gray-500'}`}>
                    {notification.message}
                  </p>
                </div>
                {!notification.readAt && (
                  <div className="flex items-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      <span className="sr-only sm:not-sr-only sm:text-xs">Marcar lida</span>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Próxima
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
