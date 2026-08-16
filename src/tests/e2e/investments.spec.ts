import { test, expect } from '@playwright/test';
import { selectOption, datetimeLocalNow } from './fixtures/helpers';

test.describe('Investimentos', () => {
  test('cria, edita e exclui um investimento', async ({ page }) => {
    const description = `Investimento E2E ${Date.now()}`;
    const editedDescription = `${description} (editado)`;

    await page.goto('/investments');
    await expect(page.getByRole('heading', { name: 'Investimentos' })).toBeVisible();

    // Create
    await page.getByLabel('Descrição').fill(description);
    await page.getByLabel('Valor (R$)').fill('300.00');
    await selectOption(page, 'Tipo', 'Renda Fixa');
    await page.getByLabel('Data do Investimento').fill(datetimeLocalNow());
    await page.getByRole('button', { name: 'Adicionar Investimento' }).click();

    const row = page.getByRole('row').filter({ hasText: description });
    await expect(row).toBeVisible();
    await expect(row).toContainText('Renda Fixa');

    // Edit
    await row.getByRole('button', { name: 'Editar' }).click();
    const dialog = page.getByRole('dialog', { name: 'Editar Investimento' });
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

  test('filtra investimentos por tipo', async ({ page }) => {
    const description = `Filtro Investimento E2E ${Date.now()}`;

    await page.goto('/investments');
    await page.getByLabel('Descrição').fill(description);
    await page.getByLabel('Valor (R$)').fill('150.00');
    await selectOption(page, 'Tipo', 'Renda Fixa');
    await page.getByLabel('Data do Investimento').fill(datetimeLocalNow());
    await page.getByRole('button', { name: 'Adicionar Investimento' }).click();

    await expect(page.getByRole('row').filter({ hasText: description })).toBeVisible();

    await page.getByPlaceholder('Buscar por descrição...').fill('nome-que-nao-existe-xyz');
    await expect(page.getByRole('row').filter({ hasText: description })).toHaveCount(0);
    await expect(page.getByText('Nenhum investimento registrado.')).toBeVisible();
  });
});
