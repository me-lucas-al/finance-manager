import { describe, expect, it, vi } from 'vitest';
import { runForUsers } from '@/app/api/cron/run-for-users';

describe('runForUsers', () => {
  it('runs the task for every user and counts failures without stopping', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const task = vi.fn(async (userId: string) => {
      if (userId === 'b') throw new Error('boom');
    });

    const summary = await runForUsers('test', ['a', 'b', 'c'], task);

    expect(task).toHaveBeenCalledTimes(3);
    expect(summary).toEqual({ users: 3, failed: 1 });
  });
});
