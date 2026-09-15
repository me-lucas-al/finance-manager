import { test, expect } from '@playwright/test';

test.describe('Navegação', () => {
  test('mostra a página de Overview com os dados consolidados', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
    await expect(page.getByText('CONTAS BANCÁRIAS')).toBeVisible();
    await expect(page.getByText('CARTÃO DE CRÉDITO')).toBeVisible();
    await expect(page.getByText('INVESTIMENTOS')).toBeVisible();
    await expect(page.getByText('EVOLUÇÃO DO SALDO')).toBeVisible();
  });

  test('navega entre as páginas principais pelo menu', async ({ page }) => {
    await page.goto('/');

    const nav = page.getByRole('navigation', { name: 'Menu Principal' }).first();
    await nav.getByRole('link', { name: 'Fluxo' }).click();
    await expect(page).toHaveURL('/movements');
    await expect(page.getByRole('heading', { name: 'Fluxo de Caixa' })).toBeVisible();

    await nav.getByRole('link', { name: 'Ativos' }).click();
    await expect(page).toHaveURL('/ativos');
    await expect(page.getByRole('heading', { name: 'Patrimônio & Ativos' })).toBeVisible();

    await nav.getByRole('link', { name: 'Conexões' }).click();
    await expect(page).toHaveURL('/connections');
    await expect(page.getByRole('heading', { name: 'Open Finance & Conexões' })).toBeVisible();

    await nav.getByRole('link', { name: 'Relatórios' }).click();
    await expect(page).toHaveURL('/reports');
    await expect(page.getByRole('heading', { name: 'Relatórios Financeiros' })).toBeVisible();
  });

  test('mostra gráficos e resumo de relatórios com dados reais', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.getByRole('heading', { name: 'Relatórios Financeiros' })).toBeVisible();
    await expect(page.getByText('Receita Total')).toBeVisible();
    await expect(page.getByText('Despesas por Categoria')).toBeVisible();
  });
});
