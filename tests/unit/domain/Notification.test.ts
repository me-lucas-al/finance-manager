import { describe, it, expect } from "vitest";
import { Notification } from "@/modules/notifications/domain/Notification";
import { NotificationType, NotificationStatus } from "@/modules/notifications/domain/types";

describe("Notification Entity", () => {
  it("should create a notification with default status and createdAt", () => {
    const notification = new Notification({
      id: "1",
      type: NotificationType.EXPENSE_WARNING,
      title: "Warning",
      message: "High expense",
    });
    
    expect(notification.status).toBe(NotificationStatus.UNREAD);
    expect(notification.createdAt).toBeInstanceOf(Date);
    expect(notification.readAt).toBeUndefined();
  });

  it("should mark as read", () => {
    const notification = new Notification({
      id: "1",
      type: NotificationType.GENERAL,
      title: "Info",
      message: "Info message",
    });

    const readNotification = notification.markAsRead();
    expect(readNotification.status).toBe(NotificationStatus.READ);
    expect(readNotification.readAt).toBeInstanceOf(Date);
    expect(readNotification.id).toBe(notification.id);
  });

  it("should do nothing if already read", () => {
    const notification = new Notification({
      id: "1",
      type: NotificationType.GENERAL,
      title: "Info",
      message: "Info message",
      status: NotificationStatus.READ,
      readAt: new Date("2024-01-01"),
    });

    const readNotification = notification.markAsRead();
    expect(readNotification).toBe(notification);
  });
});
