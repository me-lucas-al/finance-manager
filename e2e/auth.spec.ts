import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'password123';

  test('should allow user to register and login', async ({ page }) => {
    // Navigate to register page
    await page.goto('/register');
    
    // Fill the registration form
    await page.fill('#name', 'Test User');
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.locator('text=Configurações de usuário não encontradas')).toBeVisible({ timeout: 10000 });
  });

  test('should allow registered user to login', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Fill the login form
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.locator('text=Configurações de usuário não encontradas')).toBeVisible({ timeout: 10000 });
  });
});
