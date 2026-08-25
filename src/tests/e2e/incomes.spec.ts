import { test, expect } from '@playwright/test';
import { selectOption, datetimeLocalNow } from './fixtures/helpers';

test.describe('Receitas', () => {
  test('cria, edita e exclui uma receita', async ({ page }) => {
    const description = `Receita E2E ${Date.now()}`;
    const editedDescription = `${description} (editada)`;

    await page.goto('/incomes');
    await expect(page.getByRole('heading', { name: 'Receitas' })).toBeVisible();

    // Create
    await page.getByLabel('Descrição').fill(description);
    await page.getByLabel('Valor (R$)').fill('5000.00');
    await selectOption(page, 'Categoria', 'Moradia');
    await page.getByLabel('Data de Recebimento').fill(datetimeLocalNow());
    await page.getByRole('button', { name: 'Adicionar Receita' }).click();

    const row = page.getByRole('row').filter({ hasText: description });
    await expect(row).toBeVisible();

    // Edit
    await row.getByRole('button', { name: 'Editar' }).click();
    const dialog = page.getByRole('dialog', { name: 'Editar Receita' });
    await dialog.getByLabel('Descrição').fill(editedDescription);
    await dialog.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(dialog).not.toBeVisible();

    const editedRow = page.getByRole('row').filter({ hasText: editedDescription });
    await expect(editedRow).toBeVisible();

    // Delete
    await editedRow.getByRole('button', { name: 'Excluir' }).click();
    await page.getByRole('button', { name: 'Sim, excluir' }).click();
    await expect(page.getByRole('row').filter({ hasText: editedDescription })).toHaveCount(0);
  });

  test('filtra receitas por categoria', async ({ page }) => {
    const description = `Filtro Receita E2E ${Date.now()}`;

    await page.goto('/incomes');
    await page.getByLabel('Descrição').fill(description);
    await page.getByLabel('Valor (R$)').fill('1000.00');
    await selectOption(page, 'Categoria', 'Moradia');
    await page.getByLabel('Data de Recebimento').fill(datetimeLocalNow());
    await page.getByRole('button', { name: 'Adicionar Receita' }).click();

    await expect(page.getByRole('row').filter({ hasText: description })).toBeVisible();

    await page.getByPlaceholder('Buscar por descrição...').fill('nome-que-nao-existe-xyz');
    await expect(page.getByRole('row').filter({ hasText: description })).toHaveCount(0);
    await expect(page.getByText('Nenhuma receita registrada.')).toBeVisible();
  });
});
