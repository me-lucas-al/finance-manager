import { describe, it, expect, beforeEach } from 'vitest';
import { PLUGGY_MODE_REFUSAL } from '@/modules/ai/application/tools/advisor-card-mode';
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

describe('card tools outside manual mode', () => {
  const calls = [
    ['listar_cartoes', {}],
    ['cadastrar_cartao', { nome: 'X', limite: 1 }],
    ['editar_cartao', { id: 'a', nome: 'X' }],
    ['excluir_cartao', { id: 'a' }],
  ] as const;

  it.each(['pluggy', null] as const)('refuses every tool without touching cards when the mode is %s', async (mode) => {
    const harness = createCardToolsHarness();
    harness.setMode(mode);

    for (const [name, args] of calls) expect(await harness.run(name, args)).toEqual({ erro: PLUGGY_MODE_REFUSAL });

    for (const service of Object.values(harness.services)) expect(service.execute).not.toHaveBeenCalled();
  });
});
