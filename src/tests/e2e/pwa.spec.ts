import { test, expect } from '@playwright/test';

test.describe('PWA', () => {
  test('expõe um manifest.json instalável com os campos obrigatórios', async ({ request }) => {
    const response = await request.get('/manifest.json');
    expect(response.status()).toBe(200);

    const manifest = await response.json();
    expect(manifest.name).toBe('Finance Manager');
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThan(0);

    const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
  });

  test('cada ícone declarado no manifest existe e é servido com sucesso', async ({ request }) => {
    const manifest = await (await request.get('/manifest.json')).json();

    for (const icon of manifest.icons as { src: string }[]) {
      const response = await request.get(icon.src);
      expect(response.status(), `ícone ${icon.src} deveria responder 200`).toBe(200);
    }
  });

  test('a página referencia o manifest para permitir instalação', async ({ page }) => {
    await page.goto('/');
    const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifestHref).toBe('/manifest.json');
  });

  test('registra o service worker com sucesso', async ({ page }) => {
    await page.goto('/');

    const registration = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.ready;
      return { scope: reg.scope, hasActiveWorker: reg.active !== null };
    });

    expect(registration.hasActiveWorker).toBe(true);
    expect(registration.scope).toContain('/');
  });

  test('serve o service worker com o content-type correto para o navegador executar', async ({ request }) => {
    const response = await request.get('/sw.js');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('javascript');
  });
});
