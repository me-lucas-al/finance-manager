import { describe, it, expect, beforeEach } from 'vitest';
import { createCardToolsHarness } from '@/tests/fakes/advisor-card-tools-harness';

describe('editar_cartao', () => {
  let harness: ReturnType<typeof createCardToolsHarness>;

  beforeEach(() => {
    harness = createCardToolsHarness();
  });

  it('sends only the informed fields', async () => {
    expect(await harness.run('editar_cartao', { id: 'a', limite: 9000 })).toEqual({ status: 'atualizado' });
    expect(harness.services.update.execute).toHaveBeenCalledWith('user-1', 'a', {
      name: undefined,
      creditLimit: 9000,
      lastDigits: undefined,
      closingDay: undefined,
    });
  });

  it('clears digits and closing day with an empty string and zero', async () => {
    await harness.run('editar_cartao', { id: 'a', final: '', dia_fechamento: 0 });

    expect(harness.services.update.execute).toHaveBeenCalledWith('user-1', 'a', expect.objectContaining({ lastDigits: null, closingDay: null }));
  });
});
