# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication >> should allow registered user to login
- Location: e2e\auth.spec.ts:24:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*\/dashboard/
Received string:  "http://localhost:3000/login"

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    3 × locator resolved to <html lang="en" class="__variable_246ccd __variable_c29908 h-full antialiased">…</html>
      - unexpected value "http://localhost:3000/login"
  - Test timeout of 30000ms exceeded.

```

```yaml
- text: Login Entre na sua conta para acessar o sistema. Email
- textbox "Email"
- text: Senha
- textbox "Senha"
- button "Entrar"
- text: Não tem uma conta?
- link "Cadastre-se":
  - /url: /register
- heading "Instalar Aplicativo" [level=3]
- paragraph: Adicione este aplicativo à sua tela inicial para acesso rápido e offline.
- region "Notifications alt+T"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Authentication', () => {
  4  |   const testEmail = `test-${Date.now()}@example.com`;
  5  |   const testPassword = 'password123';
  6  | 
  7  |   test('should allow user to register and login', async ({ page }) => {
  8  |     // Navigate to register page
  9  |     await page.goto('/register');
  10 |     
  11 |     // Fill the registration form
  12 |     await page.fill('#name', 'Test User');
  13 |     await page.fill('#email', testEmail);
  14 |     await page.fill('#password', testPassword);
  15 |     
  16 |     // Submit form
  17 |     await page.click('button[type="submit"]');
  18 |     
  19 |     // Wait for redirect to dashboard
  20 |     await expect(page).toHaveURL(/.*\/dashboard/);
  21 |     await expect(page.locator('text=Configurações de usuário não encontradas')).toBeVisible({ timeout: 10000 });
  22 |   });
  23 | 
  24 |   test('should allow registered user to login', async ({ page }) => {
  25 |     // Navigate to login page
  26 |     await page.goto('/login');
  27 |     
  28 |     // Fill the login form
  29 |     await page.fill('#email', testEmail);
  30 |     await page.fill('#password', testPassword);
  31 |     
  32 |     // Submit form
  33 |     await page.click('button[type="submit"]');
  34 |     
  35 |     // Wait for redirect to dashboard
> 36 |     await expect(page).toHaveURL(/.*\/dashboard/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  37 |     await expect(page.locator('text=Configurações de usuário não encontradas')).toBeVisible({ timeout: 10000 });
  38 |   });
  39 | });
  40 | 
```