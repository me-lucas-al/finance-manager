import { vi } from 'vitest';

export function createFakeGoalsReplyInterpreter() {
  return { interpret: vi.fn() };
}
