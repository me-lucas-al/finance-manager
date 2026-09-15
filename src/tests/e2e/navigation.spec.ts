import { test, expect } from '@playwright/test';

test.describe('Navegação', () => {
  test('mostra o dashboard com as métricas do período', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Receita Total')).toBeVisible();
    await expect(page.getByText('Total Gasto')).toBeVisible();
    await expect(page.getByText('Total Investido')).toBeVisible();
    await expect(page.getByText('Saldo Atual')).toBeVisible();
  });

  test('navega entre as páginas principais pelo menu', async ({ page }) => {
    await page.goto('/');

    const nav = page.getByRole('navigation').first();
    await nav.getByRole('link', { name: 'Movimentações' }).click();
    await expect(page).toHaveURL('/movements');
    await expect(page.getByRole('heading', { name: 'Movimentações' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Transações' })).toBeVisible();

    await nav.getByRole('link', { name: 'Conexões' }).click();
    await expect(page).toHaveURL('/connections');
    await expect(page.getByRole('heading', { name: 'Conexões' })).toBeVisible();

    await nav.getByRole('link', { name: 'Calendário' }).click();
    await expect(page).toHaveURL('/periods');
    await expect(page.getByRole('heading', { name: 'Calendário Financeiro' })).toBeVisible();

    await nav.getByRole('link', { name: 'Configurações' }).click();
    await expect(page).toHaveURL('/settings');
    await expect(page.getByRole('heading', { name: 'Configurações' })).toBeVisible();
  });

  test('navega entre as sub-abas de Movimentações', async ({ page }) => {
    await page.goto('/movements');
    await expect(page.getByRole('tab', { name: 'Transações' })).toBeVisible();

    await page.getByRole('tab', { name: 'Receitas' }).click();
    await expect(page).toHaveURL('/movements?tab=incomes');

    await page.getByRole('tab', { name: 'Investimentos' }).click();
    await expect(page).toHaveURL('/movements?tab=investments');
  });

  test('mostra gráficos e resumo de relatórios com dados reais', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.getByRole('heading', { name: 'Relatórios' })).toBeVisible();
    await expect(page.getByText('Receita Total')).toBeVisible();
    await expect(page.getByText('Despesas por Categoria')).toBeVisible();
  });
});
