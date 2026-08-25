import { test, expect } from '@playwright/test';
import { loadTestUser } from './fixtures/test-user';

// These tests exercise unauthenticated flows, so they run with a clean,
// signed-out browser context instead of the project's default logged-in state.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Autenticação e Login', () => {
  test('redireciona para /login quando não autenticado ao acessar a raiz', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });

  test('redireciona rotas protegidas para /login quando não autenticado', async ({ page }) => {
    const protectedRoutes = ['/expenses', '/incomes', '/investments', '/periods', '/settings', '/reports'];
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

  test('mostra erro ao tentar login com email não cadastrado', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(`usuario-inexistente-${Date.now()}@example.com`);
    await page.getByLabel('Senha').fill('senha123456');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.locator('form').getByRole('alert')).toHaveText('Credenciais inválidas');
    await expect(page).toHaveURL('/login');
  });

  test('mostra erro ao tentar login com senha incorreta', async ({ page }) => {
    const testUser = loadTestUser();

    await page.goto('/login');
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Senha').fill('senha_errada_123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.locator('form').getByRole('alert')).toHaveText('Credenciais inválidas');
    await expect(page).toHaveURL('/login');
  });

  test('permite cadastro de uma nova conta e entra automaticamente', async ({ page }) => {
    const email = `e2e-register-${Date.now()}@example.com`;

    await page.goto('/register');
    await page.getByLabel('Nome').fill('Novo Usuário');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Senha').fill('outrasenha123');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('rejeita email já cadastrado com mensagem formatada', async ({ page }) => {
    const testUser = loadTestUser();

    await page.goto('/register');
    await page.getByLabel('Nome').fill('Duplicado');
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Senha').fill('outrasenha123');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    const alert = page.locator('form').getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toHaveText('Email já cadastrado');
  });

  test('valida senha mínima no cadastro', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('Nome').fill('Senha Curta');
    await page.getByLabel('Email').fill(`curto-${Date.now()}@example.com`);
    await page.getByLabel('Senha').fill('123');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    // HTML5 / Zod validation
    await expect(page).toHaveURL('/register');
  });

  test('permite login com credenciais válidas com sucesso', async ({ page }) => {
    const testUser = loadTestUser();

    await page.goto('/login');
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Senha').fill(testUser.password);
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});

test.describe('Sessão autenticada', () => {
  // Reuses the project's default logged-in storage state (see auth.setup.ts).
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

