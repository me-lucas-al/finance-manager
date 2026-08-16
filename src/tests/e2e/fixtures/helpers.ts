import type { Page } from '@playwright/test';

export async function selectOption(page: Page, labelText: string, optionText: string) {
  await page.getByLabel(labelText).click();
  await page.getByRole('option', { name: optionText }).click();
}

export function datetimeLocalNow(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}
