import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EntryActionService, type EntryActionPorts } from '@/modules/finance/application/services/entry-action-service';
import {
  SESSION_EXPIRED_MESSAGE,
  UNEXPECTED_FAILURE_MESSAGE,
} from '@/modules/finance/application/services/describe-entry-action-failure';
import type { SpendingAlert } from '@/modules/finance/domain/models/spending-patterns';

const alert: SpendingAlert = { type: 'repeated_small', category: 'Café', message: 'Muitos gastos pequenos' };

describe('EntryActionService', () => {
  let ports: EntryActionPorts;
  let service: EntryActionService;
  const validExpense = { type: 'expense', amount: 25.5, description: 'Almoço', category: 'Alimentação', date: '2026-03-10' };

  beforeEach(() => {
    ports = {
      resolveUserId: vi.fn(async () => 'user-1'),
      registerEntry: { execute: vi.fn(async () => ({ alerts: [alert] })) },
      updateEntry: { execute: vi.fn(async () => {}) },
      deleteEntry: { execute: vi.fn(async () => {}) },
      reportUnexpectedError: vi.fn(),
    };
    service = new EntryActionService(ports);
  });

  it('registers the entry for the resolved user and returns alerts', async () => {
    const result = await service.create(validExpense);

    expect(result).toEqual({ ok: true, alerts: [alert] });
    expect(ports.registerEntry.execute).toHaveBeenCalledWith('user-1', validExpense);
  });

  it.each([0, -5, Number.NaN])('rejects amount %s without touching the repositories', async (amount) => {
    const result = await service.create({ ...validExpense, amount });

    expect(result.ok).toBe(false);
    expect(ports.resolveUserId).not.toHaveBeenCalled();
    expect(ports.registerEntry.execute).not.toHaveBeenCalled();
  });

  it('rejects an impossible calendar date', async () => {
    const result = await service.create({ ...validExpense, date: '2026-02-31' });

    expect(result).toEqual({ ok: false, error: 'Data inválida' });
  });

  it('rejects a blank description and an unknown type', async () => {
    expect(await service.create({ ...validExpense, description: '   ' })).toEqual({ ok: false, error: 'Informe a descrição' });
    expect(await service.create({ ...validExpense, type: 'transfer' })).toEqual({
      ok: false,
      error: 'Tipo de lançamento inválido',
    });
  });

  it('rejects an unknown necessity', async () => {
    const result = await service.create({ ...validExpense, necessity: 'luxo' });

    expect(result).toEqual({ ok: false, error: 'Necessidade inválida' });
  });

  it('updates only the informed fields of the referenced entry', async () => {
    const result = await service.update({ kind: 'income', id: 'abc', changes: { amount: 10 } });

    expect(result).toEqual({ ok: true, alerts: [] });
    expect(ports.updateEntry.execute).toHaveBeenCalledWith('user-1', { kind: 'income', id: 'abc' }, { amount: 10 });
  });

  it('deletes the referenced entry', async () => {
    const result = await service.remove({ kind: 'investment', id: 'abc' });

    expect(result).toEqual({ ok: true, alerts: [] });
    expect(ports.deleteEntry.execute).toHaveBeenCalledWith('user-1', { kind: 'investment', id: 'abc' });
  });

  it('returns a session message when there is no authenticated owner', async () => {
    ports.resolveUserId = vi.fn(async () => {
      throw new Error('Unauthorized');
    });

    const result = await new EntryActionService(ports).create(validExpense);

    expect(result).toEqual({ ok: false, error: SESSION_EXPIRED_MESSAGE });
  });

  it('hides unexpected failures behind a generic message and reports them', async () => {
    const failure = new Error('db down');
    ports.registerEntry.execute = vi.fn(async () => {
      throw failure;
    });

    const result = await new EntryActionService(ports).create(validExpense);

    expect(result).toEqual({ ok: false, error: UNEXPECTED_FAILURE_MESSAGE });
    expect(ports.reportUnexpectedError).toHaveBeenCalledWith(failure);
  });
});
