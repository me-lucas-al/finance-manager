import { describe, it, expect, beforeEach } from 'vitest';
import { PLUGGY_MODE_REFUSAL } from '@/modules/ai/application/tools/advisor-card-mode';
import { createAdvisorToolsHarness } from '@/tests/fakes/advisor-tools-harness';

type Harness = ReturnType<typeof createAdvisorToolsHarness>;

describe('registrar_lancamento with a credit card', () => {
  let harness: Harness;
  const expense = { tipo: 'expense', categoria: 'Mercado', descricao: 'Fatura', valor: 300 };

  beforeEach(() => {
    harness = createAdvisorToolsHarness();
  });

  it('forwards the card id to the entry use case in manual mode', async () => {
    await harness.run('registrar_lancamento', { ...expense, cartao_id: 'card-1' });

    expect(harness.registerEntry.execute).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ type: 'expense', amount: 300, creditCardId: 'card-1' })
    );
  });

  it('does not send a card when none is informed', async () => {
    await harness.run('registrar_lancamento', expense);

    expect(harness.registerEntry.execute.mock.calls[0][1]).not.toHaveProperty('creditCardId');
  });

  it('refuses a card in pluggy mode and registers nothing', async () => {
    harness.creditCards.readDataMode.mockResolvedValue('pluggy');

    const result = await harness.run('registrar_lancamento', { ...expense, cartao_id: 'card-1' });

    expect(result).toEqual({ erro: PLUGGY_MODE_REFUSAL });
    expect(harness.registerEntry.execute).not.toHaveBeenCalled();
  });

  it('still registers entries without a card in pluggy mode', async () => {
    harness.creditCards.readDataMode.mockResolvedValue('pluggy');

    await harness.run('registrar_lancamento', expense);

    expect(harness.registerEntry.execute).toHaveBeenCalledTimes(1);
  });
});

describe('editar_lancamento with a credit card', () => {
  let harness: Harness;

  beforeEach(() => {
    harness = createAdvisorToolsHarness();
  });

  it('links the card on edit', async () => {
    await harness.run('editar_lancamento', { id: 'e1', tipo: 'expense', cartao_id: 'card-1' });

    expect(harness.updateEntry.execute).toHaveBeenCalledWith('user-1', { kind: 'expense', id: 'e1' }, expect.objectContaining({ creditCardId: 'card-1' }));
  });

  it('unlinks with an empty string and leaves the card alone when omitted', async () => {
    await harness.run('editar_lancamento', { id: 'e1', tipo: 'expense', cartao_id: '' });
    await harness.run('editar_lancamento', { id: 'e1', tipo: 'expense', valor: 5 });

    const [unlink, untouched] = harness.updateEntry.execute.mock.calls.map((call) => call[2]);
    expect(unlink.creditCardId).toBeNull();
    expect(untouched.creditCardId).toBeUndefined();
  });

  it('refuses a card in pluggy mode', async () => {
    harness.creditCards.readDataMode.mockResolvedValue('pluggy');

    const result = await harness.run('editar_lancamento', { id: 'e1', tipo: 'expense', cartao_id: 'card-1' });

    expect(result).toEqual({ erro: PLUGGY_MODE_REFUSAL });
    expect(harness.updateEntry.execute).not.toHaveBeenCalled();
  });
});
