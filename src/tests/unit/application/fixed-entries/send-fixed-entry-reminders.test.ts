import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SendFixedEntryRemindersUseCase } from '@/modules/finance/application/fixed-entries/send-fixed-entry-reminders';
import type { ReminderPreferences } from '@/modules/finance/domain/ports/fixed-entry-messaging';
import { FakeFixedEntryRepository } from '@/tests/fakes/fake-fixed-entry-repository';
import { makeFixedEntry } from '@/tests/fakes/fixed-entry-fixture';

const NOW = new Date('2026-03-10T15:00:00Z');

describe('SendFixedEntryRemindersUseCase', () => {
  let rules: FakeFixedEntryRepository;
  let preferences: ReminderPreferences;
  let sentKeys: Set<string>;
  const delivery = { deliver: vi.fn(async () => {}) };

  const buildUseCase = () =>
    new SendFixedEntryRemindersUseCase(
      rules,
      { read: async () => preferences },
      delivery,
      { wasSent: async (key) => sentKeys.has(key), markSent: async (key) => void sentKeys.add(key) },
      () => NOW
    );

  beforeEach(() => {
    delivery.deliver.mockClear();
    rules = new FakeFixedEntryRepository();
    preferences = { expense: true, general: true, push: true };
    sentKeys = new Set();
    rules.items.push(
      makeFixedEntry({ id: 'tomorrow', dueDay: 11, description: 'Internet' }),
      makeFixedEntry({ id: 'today', dueDay: 10 }),
      makeFixedEntry({ id: 'later', dueDay: 15 }),
      makeFixedEntry({ id: 'paused', dueDay: 11, active: false })
    );
  });

  it('reminds only about rules due tomorrow', async () => {
    const sent = await buildUseCase().execute('user-1');

    expect(sent).toBe(1);
    expect(delivery.deliver).toHaveBeenCalledTimes(1);
    expect(delivery.deliver).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Internet') }), true);
  });

  it('does not repeat a reminder already sent', async () => {
    await buildUseCase().execute('user-1');
    const second = await buildUseCase().execute('user-1');

    expect(second).toBe(0);
    expect(delivery.deliver).toHaveBeenCalledTimes(1);
    expect([...sentKeys]).toEqual(['fixed-reminder:tomorrow:2026-03-11']);
  });

  it('respects the expense notification preference', async () => {
    preferences = { expense: false, general: true, push: true };

    expect(await buildUseCase().execute('user-1')).toBe(0);
    expect(delivery.deliver).not.toHaveBeenCalled();
  });

  it('uses the general preference for incomes and tells delivery whether push is on', async () => {
    rules.items = [makeFixedEntry({ id: 'salary', kind: 'income', dueDay: 11 })];
    preferences = { expense: false, general: true, push: false };

    expect(await buildUseCase().execute('user-1')).toBe(1);
    expect(delivery.deliver).toHaveBeenCalledWith(expect.anything(), false);
  });

  it('does not mark as sent when delivery fails, so it is retried', async () => {
    delivery.deliver.mockRejectedValueOnce(new Error('telegram down'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(await buildUseCase().execute('user-1')).toBe(0);
    expect(sentKeys.size).toBe(0);
  });
});
