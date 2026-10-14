import { test, expect } from '@playwright/test';
import { loadTestUser } from './fixtures/test-user';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Cadastro', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('rejeita cadastro quando confirmação de senha não confere', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('Nome').fill('Mismatch User');
    await page.getByLabel('Email').fill(`mismatch-${Date.now()}@example.com`);
    await page.getByLabel('Senha', { exact: true }).fill('senha123456');
    await page.getByLabel('Confirmar Senha').fill('outrasenha654');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    const alert = page.locator('form').getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toHaveText('As senhas não coincidem');
  });

  test('permite cadastro de uma nova conta com confirmação de senha e entra automaticamente', async ({ page }) => {
    const email = `e2e-register-${Date.now()}@example.com`;

    await page.goto('/register');
    await page.getByLabel('Nome').fill('Novo Usuário');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Senha', { exact: true }).fill('outrasenha123');
    await page.getByLabel('Confirmar Senha').fill('outrasenha123');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('rejeita email já cadastrado com mensagem formatada', async ({ page }) => {
    const testUser = loadTestUser();

    await page.goto('/register');
    await page.getByLabel('Nome').fill('Duplicado');
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Senha', { exact: true }).fill('outrasenha123');
    await page.getByLabel('Confirmar Senha').fill('outrasenha123');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    const alert = page.locator('form').getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toHaveText('Email já cadastrado');
  });

  test('valida senha mínima no cadastro', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('Nome').fill('Senha Curta');
    await page.getByLabel('Email').fill(`curto-${Date.now()}@example.com`);
    await page.getByLabel('Senha', { exact: true }).fill('123');
    await page.getByLabel('Confirmar Senha').fill('123');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page).toHaveURL('/register');
  });
});
