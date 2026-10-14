export interface UserNotification {
  id: string;
  title: string;
  message: string;
  readAt: Date | null;
  createdAt: Date;
}
