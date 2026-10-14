import { test, expect } from '@playwright/test';
import { loadTestUser } from './fixtures/test-user';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Recuperação de senha', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('permite solicitar recuperação de senha e redefinir com segurança via token do email', async ({ page }) => {
    const testUser = loadTestUser();

    await page.goto('/login');
    await page.getByRole('link', { name: 'Esqueceu a senha?' }).click();
    await expect(page).toHaveURL('/forgot-password');
    await expect(page.getByText('Recuperar Senha').first()).toBeVisible();

    await page.getByLabel('Email').fill(testUser.email);
    await page.getByRole('button', { name: 'Enviar instruções' }).click();

    await expect(page.getByRole('status')).toBeVisible();
    await expect(page.getByRole('status')).toContainText('enviamos um link para redefinição');

    await page.goto('/reset-password');
    await expect(page.locator('p[role="alert"]')).toContainText('Token de redefinição não encontrado ou inválido');

    await page.goto('/reset-password?token=token-invalido-inexistente');
    await page.locator('#reset-password').fill('novaSenha123');
    await page.locator('#reset-confirm-password').fill('novaSenha123');
    await page.getByRole('button', { name: 'Redefinir senha' }).click();
    await expect(page.locator('p[role="alert"]')).toContainText('Link de redefinição inválido ou expirado');
  });
});

test.describe('Sessão autenticada', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('redireciona para / quando já autenticado e tenta acessar /login', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL('/');
  });

  test('redireciona para / quando já autenticado e tenta acessar /register', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveURL('/');
  });

  test('permite logout e bloqueia acesso posterior', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sair' }).click();

    await expect(page).toHaveURL('/login');

    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });
});

