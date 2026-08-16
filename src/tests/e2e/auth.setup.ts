import { test as setup, expect } from '@playwright/test';
import { saveTestUser, type TestUser } from './fixtures/test-user';

const authFile = 'playwright/.auth/user.json';

const testUser: TestUser = {
  name: 'E2E Test User',
  email: `e2e-${Date.now()}@example.com`,
  password: 'senha123456',
};

setup('register and authenticate test user', async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel('Nome').fill(testUser.name);
  await page.getByLabel('Email').fill(testUser.email);
  await page.getByLabel('Senha').fill(testUser.password);
  await page.getByRole('button', { name: 'Criar conta' }).click();

  await expect(page).toHaveURL('/', { timeout: 45000 });
  await page.context().storageState({ path: authFile });
  saveTestUser(testUser);
});
