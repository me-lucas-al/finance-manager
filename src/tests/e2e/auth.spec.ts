import { test, expect } from '@playwright/test';
import { loadTestUser } from './fixtures/test-user';

// These tests exercise unauthenticated flows, so they run with a clean,
// signed-out browser context instead of the project's default logged-in state.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Autenticação', () => {
  test('redireciona para /login quando não autenticado', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });

  test('mostra erro para credenciais inválidas', async ({ page }) => {
    const testUser = loadTestUser();

    await page.goto('/login');
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Senha').fill('senha-errada');
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Scoped to the form: Next.js's own route announcer also has role="alert".
    await expect(page.locator('form').getByRole('alert')).toHaveText('Credenciais inválidas');
    await expect(page).toHaveURL('/login');
  });

  test('permite cadastro de uma nova conta', async ({ page }) => {
    const email = `e2e-register-${Date.now()}@example.com`;

    await page.goto('/register');
    await page.getByLabel('Nome').fill('Novo Usuário');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Senha').fill('outrasenha123');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('rejeita email já cadastrado', async ({ page }) => {
    const testUser = loadTestUser();

    await page.goto('/register');
    await page.getByLabel('Nome').fill('Duplicado');
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Senha').fill('outrasenha123');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page.locator('form').getByRole('alert')).toHaveText('Email já cadastrado');
  });

  test('permite login com credenciais válidas', async ({ page }) => {
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

  test('redireciona para / quando já autenticado e acessa /login', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL('/');
  });

  test('permite logout e bloqueia acesso depois', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sair' }).click();

    await expect(page).toHaveURL('/login');

    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });
});
