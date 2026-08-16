import { test, expect } from '@playwright/test';
import { selectOption, datetimeLocalNow } from './fixtures/helpers';

test.describe('Despesas', () => {
  test('cria, edita e exclui uma despesa', async ({ page }) => {
    const description = `Despesa E2E ${Date.now()}`;
    const editedDescription = `${description} (editada)`;

    await page.goto('/expenses');
    await expect(page.getByRole('heading', { name: 'Despesas' })).toBeVisible();

    // Create
    await page.getByLabel('Descrição').fill(description);
    await page.getByLabel('Valor (R$)').fill('123.45');
    await selectOption(page, 'Categoria', 'Alimentação');
    await page.getByLabel('Data', { exact: true }).fill(datetimeLocalNow());
    await page.getByRole('button', { name: 'Adicionar Despesa' }).click();

    const row = page.getByRole('row').filter({ hasText: description });
    await expect(row).toBeVisible();
    await expect(row).toContainText('Alimentação');
    await expect(row).toContainText('R$');

    // Edit
    await row.getByRole('button', { name: 'Editar' }).click();
    const dialog = page.getByRole('dialog', { name: 'Editar Despesa' });
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

  test('filtra despesas por categoria', async ({ page }) => {
    const description = `Filtro E2E ${Date.now()}`;

    await page.goto('/expenses');
    await page.getByLabel('Descrição').fill(description);
    await page.getByLabel('Valor (R$)').fill('50.00');
    await selectOption(page, 'Categoria', 'Transporte');
    await page.getByLabel('Data', { exact: true }).fill(datetimeLocalNow());
    await page.getByRole('button', { name: 'Adicionar Despesa' }).click();

    await expect(page.getByRole('row').filter({ hasText: description })).toBeVisible();

    await page.getByPlaceholder('Buscar por descrição...').fill('nome-que-nao-existe-xyz');
    await expect(page.getByRole('row').filter({ hasText: description })).toHaveCount(0);
    await expect(page.getByText('Nenhuma despesa registrada.')).toBeVisible();
  });
});
