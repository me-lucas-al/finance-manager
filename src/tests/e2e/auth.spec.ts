import { test, expect } from '@playwright/test';
import { loadTestUser } from './fixtures/test-user';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Autenticação e Login', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('redireciona para /login quando não autenticado ao acessar a raiz', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });

  test('redireciona rotas protegidas para /login quando não autenticado', async ({ page }) => {
    const protectedRoutes = ['/movements', '/periods', '/settings', '/reports'];
    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL('/login');
    }
  });

  test('permite navegar da tela de login para a tela de cadastro', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Cadastre-se' }).click();
    await expect(page).toHaveURL('/register');
    await expect(page.getByText('Criar conta').first()).toBeVisible();
  });

  test('permite alternar visibilidade da senha pelo toggle', async ({ page }) => {
    await page.goto('/login');
    const passwordInput = page.locator('#password');
    await passwordInput.fill('minha-senha-secreta');

    await expect(passwordInput).toHaveAttribute('type', 'password');

    await page.getByRole('button', { name: 'Mostrar senha' }).click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    await page.getByRole('button', { name: 'Ocultar senha' }).click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('mostra erro ao tentar login com email não cadastrado', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(`usuario-inexistente-${Date.now()}@example.com`);
    await page.locator('#password').fill('senha123456');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.locator('form').getByRole('alert')).toHaveText('Credenciais inválidas');
    await expect(page).toHaveURL('/login');
  });

  test('mostra erro ao tentar login com senha incorreta', async ({ page }) => {
    const testUser = loadTestUser();

    await page.goto('/login');
    await page.getByLabel('Email').fill(testUser.email);
    await page.locator('#password').fill('senha_errada_123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.locator('form').getByRole('alert')).toHaveText('Credenciais inválidas');
    await expect(page).toHaveURL('/login');
  });

  test('permite login com credenciais válidas com sucesso', async ({ page }) => {
    const testUser = loadTestUser();

    await page.goto('/login');
    await page.getByLabel('Email').fill(testUser.email);
    await page.locator('#password').fill(testUser.password);
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
