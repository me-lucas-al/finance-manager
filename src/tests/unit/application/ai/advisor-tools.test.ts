import { describe, it, expect, beforeEach } from 'vitest';
import { createAdvisorToolsHarness } from '@/tests/fakes/advisor-tools-harness';

type Harness = ReturnType<typeof createAdvisorToolsHarness>;

describe('Advisor query tools', () => {
  let run: Harness['run'];
  let tools: Harness['tools'];

  beforeEach(() => {
    ({ run, tools } = createAdvisorToolsHarness());
  });

  it('provides every query, entry, goal and memory tool', () => {
    expect(tools.map((tool) => tool.name).sort()).toEqual(
      [
        'atualizar_metas',
        'buscar_lancamentos',
        'cadastrar_fixo',
        'comparar_periodos',
        'consultar_investimentos',
        'consultar_metas',
        'consultar_saldo',
        'definir_limite_categoria',
        'editar_fixo',
        'editar_lancamento',
        'excluir_fixo',
        'excluir_lancamento',
        'listar_categorias',
        'listar_fixos',
        'pausar_fixo',
        'registrar_lancamento',
        'salvar_memoria',
        'total_por_categoria',
      ].sort()
    );
  });

  it('searches every kind of entry and returns ids for editing', async () => {
    const result = (await run('buscar_lancamentos', { periodo: '2026-03', tipo: 'income' })) as Array<{ id: string; tipo: string }>;

    expect(result.map((item) => item.id).sort()).toEqual(['i3']);
    const investments = (await run('buscar_lancamentos', { tipo: 'investment' })) as Array<{ id: string }>;
    expect(investments.map((item) => item.id)).toEqual(['v1']);
  });

  it('reports the same balance as the dashboard ledger', async () => {
    const result = (await run('consultar_saldo')) as { saldoTotal: number; totalInvestido: number };

    expect(result.saldoTotal).toBeCloseTo(11000 - 1600.2 - 800, 2);
    expect(result.totalInvestido).toBe(800);
  });

  it('totals expenses by category for the informed month', async () => {
    expect(await run('total_por_categoria', { periodo: '2026-03' })).toEqual({ Mercado: 99.9, Outros: 300.2 });
  });

  it('validates periods and limits before querying or saving', async () => {
    expect(await run('comparar_periodos', { periodoA: '2026-03' })).toHaveProperty('erro');
    expect(await run('total_por_categoria', { periodo: 'marco' })).toHaveProperty('erro');
    expect(await run('definir_limite_categoria', { categoria: 'Lazer', valor: -5 })).toHaveProperty('erro');
  });
});
