# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: critical-paths.spec.ts >> Critical Paths >> should view reports
- Location: e2e\critical-paths.spec.ts:74:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_RESET at http://localhost:3000/login
Call log:
  - navigating to "http://localhost:3000/login", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { seedTestUser, cleanupTestUser, closeDb } from './test-utils';
  3  | import bcrypt from 'bcryptjs';
  4  | 
  5  | test.describe('Critical Paths', () => {
  6  |   const testEmail = `e2e-critical-${Date.now()}@example.com`;
  7  |   const testPassword = 'password123';
  8  |   
  9  |   test.beforeAll(async () => {
  10 |     const hash = await bcrypt.hash(testPassword, 10);
  11 |     await seedTestUser(testEmail, hash);
  12 |   });
  13 | 
  14 |   test.afterAll(async () => {
  15 |     await cleanupTestUser(testEmail);
  16 |     await closeDb();
  17 |   });
  18 | 
  19 |   test.beforeEach(async ({ page }) => {
  20 |     // Login before each test
> 21 |     await page.goto('/login');
     |                ^ Error: page.goto: net::ERR_CONNECTION_RESET at http://localhost:3000/login
  22 |     await page.fill('#email', testEmail);
  23 |     await page.fill('#password', testPassword);
  24 |     await page.click('button[type="submit"]');
  25 |     await expect(page).toHaveURL(/.*\/dashboard/);
  26 |     await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
  27 |   });
  28 | 
  29 |   test('should create an expense', async ({ page }) => {
  30 |     await page.goto('/expenses');
  31 |     
  32 |     // Click Nova Despesa
  33 |     await page.click('button:has-text("Nova Despesa")');
  34 |     
  35 |     // Fill the form
  36 |     await page.fill('input[name="description"]', 'E2E Test Expense');
  37 |     await page.fill('input[name="amount"]', '150.50');
  38 |     await page.fill('input[name="date"]', new Date().toISOString().split('T')[0]);
  39 |     
  40 |     // Select Category (shadcn select)
  41 |     await page.click('form button[role="combobox"]');
  42 |     await page.click('div[role="option"]:has-text("Alimentação")');
  43 | 
  44 |     // Submit
  45 |     await page.click('form button:has-text("Salvar")');
  46 |     
  47 |     // Check if expense was created
  48 |     await expect(page.locator('text=E2E Test Expense')).toBeVisible();
  49 |     await expect(page.locator('text=150,50')).toBeVisible();
  50 |   });
  51 | 
  52 |   test('should create an investment', async ({ page }) => {
  53 |     await page.goto('/investments');
  54 |     
  55 |     // Click Novo Investimento
  56 |     await page.click('button:has-text("Novo Investimento")');
  57 |     
  58 |     // Fill the form
  59 |     await page.fill('input[name="description"]', 'E2E Test Investment');
  60 |     await page.fill('input[name="amount"]', '500.00');
  61 |     await page.fill('input[name="date"]', new Date().toISOString().split('T')[0]);
  62 |     
  63 |     // Select Category
  64 |     await page.click('form button[role="combobox"]');
  65 |     await page.click('div[role="option"]:has-text("Renda Fixa")');
  66 | 
  67 |     // Submit
  68 |     await page.click('form button:has-text("Salvar")');
  69 |     
  70 |     // Check if investment was created
  71 |     await expect(page.locator('text=E2E Test Investment')).toBeVisible();
  72 |   });
  73 | 
  74 |   test('should view reports', async ({ page }) => {
  75 |     await page.goto('/reports');
  76 |     
  77 |     // Check if reports page loads
  78 |     await expect(page.locator('text=Relatórios Financeiros')).toBeVisible();
  79 |     await expect(page.locator('text=Resumo do Período')).toBeVisible();
  80 |   });
  81 | });
  82 | 
```