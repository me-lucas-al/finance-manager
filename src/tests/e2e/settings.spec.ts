import { test, expect } from '@playwright/test';

// Both tests mutate the same user's settings row; run them serially so they
// can't race each other.
test.describe.configure({ mode: 'serial' });

test.describe('Configurações', () => {
  test('atualiza as regras financeiras', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: 'Configurações' })).toBeVisible();

    const originalMaxExpenses = await page.getByLabel('Máximo de gastos (%)').inputValue();
    const originalMinInvestment = await page.getByLabel('Mínimo de investimento (%)').inputValue();

    await page.getByLabel('Máximo de gastos (%)').fill('75');
    await page.getByLabel('Mínimo de investimento (%)').fill('25');
    await page.getByRole('button', { name: 'Salvar regras' }).click();

    await expect(page.getByText('Salvo com sucesso.')).toBeVisible();

    await page.reload();
    await expect(page.getByLabel('Máximo de gastos (%)')).toHaveValue('75');
    await expect(page.getByLabel('Mínimo de investimento (%)')).toHaveValue('25');

    // Restore the original values so other tests/runs aren't affected.
    await page.getByLabel('Máximo de gastos (%)').fill(originalMaxExpenses);
    await page.getByLabel('Mínimo de investimento (%)').fill(originalMinInvestment);
    await page.getByRole('button', { name: 'Salvar regras' }).click();
    await expect(page.getByText('Salvo com sucesso.')).toBeVisible();
  });

  test('desativa e persiste uma preferência de notificação', async ({ page }) => {
    await page.goto('/settings');

    const generalNotifications = page.getByLabel('Avisos gerais');
    await expect(generalNotifications).toBeChecked();

    await generalNotifications.uncheck();
    await page.getByRole('button', { name: 'Salvar preferências' }).click();
    await expect(page.getByText('Salvo com sucesso.')).toBeVisible();

    // Regression check: unchecking a preference must actually persist as
    // false, not silently coerce back to true on reload.
    await page.reload();
    await expect(page.getByLabel('Avisos gerais')).not.toBeChecked();

    // Restore the default so other tests/runs aren't affected.
    await page.getByLabel('Avisos gerais').check();
    await page.getByRole('button', { name: 'Salvar preferências' }).click();
    await expect(page.getByText('Salvo com sucesso.')).toBeVisible();
  });

  test('ativa e persiste a preferência de notificações push', async ({ page }) => {
    await page.goto('/settings');

    const pushPreference = page.getByLabel('Notificações push');
    const wasChecked = await pushPreference.isChecked();

    await pushPreference.setChecked(!wasChecked);
    await page.getByRole('button', { name: 'Salvar preferências' }).click();
    await expect(page.getByText('Salvo com sucesso.')).toBeVisible();

    await page.reload();
    await expect(page.getByLabel('Notificações push')).toBeChecked({ checked: !wasChecked });

    // Restore the original value so other tests/runs aren't affected.
    await page.getByLabel('Notificações push').setChecked(wasChecked);
    await page.getByRole('button', { name: 'Salvar preferências' }).click();
    await expect(page.getByText('Salvo com sucesso.')).toBeVisible();
  });
});
