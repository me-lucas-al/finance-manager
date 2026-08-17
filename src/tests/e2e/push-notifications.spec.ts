import { test, expect } from '@playwright/test';

// Push notifications use the same Web Push + Service Worker implementation
// regardless of device — the same code path shows up as an OS notification
// on desktop and on a phone (installed PWA or mobile browser). These tests
// exercise that shared client-side flow through the Notification permission
// state.
//
// Headless Chromium locks the real Notification permission at "denied" and
// ignores context.grantPermissions() for it (there's no user to prompt), so
// each state is stubbed directly via an init script instead of relying on
// the browser's actual permission machinery.
async function stubNotificationPermission(page: import('@playwright/test').Page, permission: NotificationPermission) {
  await page.addInitScript((value) => {
    Object.defineProperty(Notification, 'permission', { value, configurable: true });
  }, permission);
}

test.describe('Notificações push', () => {
  test('mostra o botão para ativar quando o navegador ainda não decidiu a permissão', async ({ page }) => {
    await stubNotificationPermission(page, 'default');
    await page.goto('/settings');

    await expect(
      page.getByRole('button', { name: 'Ativar notificações push neste dispositivo' })
    ).toBeVisible();
  });

  test('reconhece que este dispositivo já está inscrito quando a permissão já foi concedida', async ({ page }) => {
    await stubNotificationPermission(page, 'granted');
    await page.goto('/settings');

    await expect(page.getByText('Notificações push ativadas neste dispositivo.')).toBeVisible();
  });

  test('avisa que a permissão foi negada quando o usuário recusou notificações', async ({ page }) => {
    await stubNotificationPermission(page, 'denied');
    await page.goto('/settings');

    await expect(page.getByText('Permissão negada. Ative nas configurações do navegador.')).toBeVisible();
  });
});
