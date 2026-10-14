import type { UserNotification } from '@/types/notification';

interface NotificationItemProps {
  notification: UserNotification;
  onRead: (id: string) => void;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const isUnread = !notification.readAt;

  return (
    <button
      type="button"
      className={`flex w-full flex-col p-3 border-b border-border text-left hover:bg-muted transition-colors ${isUnread ? 'bg-primary/10' : ''}`}
      onClick={() => onRead(notification.id)}
    >
      <div className="flex w-full justify-between items-start mb-1">
        <span className="font-semibold text-sm">{notification.title}</span>
        {isUnread && <div className="h-2 w-2 bg-primary rounded-full" />}
      </div>
      <p className="text-xs text-muted-foreground">{notification.message}</p>
      <span className="text-[10px] text-muted-foreground mt-2">
        {new Date(notification.createdAt).toLocaleDateString('pt-BR')}
      </span>
    </button>
  );
}
