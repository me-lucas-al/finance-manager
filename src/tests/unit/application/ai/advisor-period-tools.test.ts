import { describe, it, expect } from 'vitest';
import { createAdvisorToolsHarness } from '@/tests/fakes/advisor-tools-harness';

describe('Advisor period tools', () => {
  it('reports an error for a period that does not exist', async () => {
    const { run } = createAdvisorToolsHarness();

    expect(await run('buscar_lancamentos', { periodo: '2025-01' })).toHaveProperty('erro');
    expect(await run('total_por_categoria', { periodo: '2025-01' })).toHaveProperty('erro');
    expect(await run('comparar_periodos', { periodoA: '2025-01', periodoB: '2026-03' })).toHaveProperty('erro');
  });

  it('defaults category totals to the current period', async () => {
    const { run } = createAdvisorToolsHarness();

    expect(await run('total_por_categoria')).toEqual({ Mercado: 99.9, Outros: 300.2 });
  });

  it('compares two periods by the month they start in', async () => {
    const { run } = createAdvisorToolsHarness();

    const result = (await run('comparar_periodos', { periodoA: '2026-02', periodoB: '2026-03' })) as Record<string, unknown>;

    expect(result['2026-02']).toMatchObject({ expenses: 1200.1 });
    expect(result['2026-03']).toMatchObject({ expenses: 400.1 });
    expect(result.diferencaSaidas).toBe(-800);
  });

  it('reports the current period totals with the balance', async () => {
    const { run } = createAdvisorToolsHarness();

    const result = (await run('consultar_saldo')) as { periodoAtual: { expenses: number } };

    expect(result.periodoAtual.expenses).toBe(400.1);
  });

  it('caps the number of searched entries', async () => {
    const { run } = createAdvisorToolsHarness();

    const result = (await run('buscar_lancamentos', { limite: 1 })) as unknown[];

    expect(result).toHaveLength(1);
  });
});
