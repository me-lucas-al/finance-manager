import { vi } from 'vitest';

export function createFakeTelegramMessenger() {
  return {
    sendMessage: vi.fn(),
    sendToChat: vi.fn(),
    sendTyping: vi.fn(),
  };
}
