import { NotificationType, NotificationStatus } from './types';

export class Notification {
  public readonly id: string;
  public readonly type: NotificationType;
  public readonly title: string;
  public readonly message: string;
  public readonly status: NotificationStatus;
  public readonly metadata?: Record<string, unknown>;
  public readonly createdAt: Date;
  public readonly readAt?: Date;

  constructor(params: {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    status?: NotificationStatus;
    metadata?: Record<string, unknown>;
    createdAt?: Date;
    readAt?: Date;
  }) {
    this.id = params.id;
    this.type = params.type;
    this.title = params.title;
    this.message = params.message;
    this.status = params.status ?? NotificationStatus.UNREAD;
    this.metadata = params.metadata;
    this.createdAt = params.createdAt ?? new Date();
    this.readAt = params.readAt;
  }

  markAsRead(date: Date = new Date()): Notification {
    if (this.status === NotificationStatus.READ) {
      return this;
    }
    return new Notification({
      ...this,
      status: NotificationStatus.READ,
      readAt: date,
    });
  }
}
