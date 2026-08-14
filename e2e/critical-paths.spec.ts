import { test, expect } from '@playwright/test';
import { seedTestUser, cleanupTestUser, closeDb } from './test-utils';
import bcrypt from 'bcryptjs';

test.describe('Critical Paths', () => {
  const testEmail = `e2e-critical-${Date.now()}@example.com`;
  const testPassword = 'password123';
  
  test.beforeAll(async () => {
    const hash = await bcrypt.hash(testPassword, 10);
    await seedTestUser(testEmail, hash);
  });

  test.afterAll(async () => {
    await cleanupTestUser(testEmail);
    await closeDb();
  });

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('should create an expense', async ({ page }) => {
    await page.goto('/expenses');
    
    // Click Nova Despesa
    await page.click('button:has-text("Nova Despesa")');
    
    // Fill the form
    await page.fill('input[name="description"]', 'E2E Test Expense');
    await page.fill('input[name="amount"]', '150.50');
    await page.fill('input[name="date"]', new Date().toISOString().split('T')[0]);
    
    // Select Category (shadcn select)
    await page.click('form button[role="combobox"]');
    await page.click('div[role="option"]:has-text("Alimentação")');

    // Submit
    await page.click('form button:has-text("Salvar")');
    
    // Check if expense was created
    await expect(page.locator('text=E2E Test Expense')).toBeVisible();
    await expect(page.locator('text=150,50')).toBeVisible();
  });

  test('should create an investment', async ({ page }) => {
    await page.goto('/investments');
    
    // Click Novo Investimento
    await page.click('button:has-text("Novo Investimento")');
    
    // Fill the form
    await page.fill('input[name="description"]', 'E2E Test Investment');
    await page.fill('input[name="amount"]', '500.00');
    await page.fill('input[name="date"]', new Date().toISOString().split('T')[0]);
    
    // Select Category
    await page.click('form button[role="combobox"]');
    await page.click('div[role="option"]:has-text("Renda Fixa")');

    // Submit
    await page.click('form button:has-text("Salvar")');
    
    // Check if investment was created
    await expect(page.locator('text=E2E Test Investment')).toBeVisible();
  });

  test('should view reports', async ({ page }) => {
    await page.goto('/reports');
    
    // Check if reports page loads
    await expect(page.locator('text=Relatórios Financeiros')).toBeVisible();
    await expect(page.locator('text=Resumo do Período')).toBeVisible();
  });
});
