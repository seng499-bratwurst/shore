import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const { describe, beforeEach } = test;

describe('Home Page', () => {
  beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage has expected title and content', async ({ page }) => {
    await expect(page).toHaveTitle(/shore/i);
  });

  test('homepage is accessible', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
