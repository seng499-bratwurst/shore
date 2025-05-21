import { expect, test } from '@playwright/test';

test('homepage has expected title and content', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/shore/i);
});
