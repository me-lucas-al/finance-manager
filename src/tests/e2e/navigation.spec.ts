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
    await nav.getByRole('link', { name: 'Despesas' }).click();
    await expect(page).toHaveURL('/expenses');

    await nav.getByRole('link', { name: 'Receitas' }).click();
    await expect(page).toHaveURL('/incomes');

    await nav.getByRole('link', { name: 'Investimentos' }).click();
    await expect(page).toHaveURL('/investments');
    await expect(page.getByRole('heading', { name: 'Investimentos' })).toBeVisible();

    await nav.getByRole('link', { name: 'Calendário' }).click();
    await expect(page).toHaveURL('/periods');
    await expect(page.getByRole('heading', { name: 'Calendário Financeiro' })).toBeVisible();

    await nav.getByRole('link', { name: 'Configurações' }).click();
    await expect(page).toHaveURL('/settings');
  });

  test('mostra gráficos de análises e relatórios com dados reais', async ({ page }) => {
    await page.goto('/analytics');
    await expect(page.getByRole('heading', { name: 'Análises' })).toBeVisible();
    await expect(page.getByText('Despesas por Categoria')).toBeVisible();

    await page.goto('/reports');
    await expect(page.getByRole('heading', { name: 'Relatórios' })).toBeVisible();
    await expect(page.getByText('Receita Total')).toBeVisible();
  });
});
