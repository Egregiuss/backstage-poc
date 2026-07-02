import { test, expect } from '@playwright/test';

test('App should render the welcome page', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Backstage/i);
});

test('Catalog page loads', async ({ page }) => {
  await page.goto('/catalog');
  await expect(page).toHaveURL(/catalog/);
});
