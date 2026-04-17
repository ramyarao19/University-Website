import { test as base, expect, Page } from '@playwright/test';

/**
 * Custom fixture that resets localStorage before each test
 * so seed.json is re-fetched, giving consistent data.
 */
export const test = base.extend<{ resetPage: Page }>({
  resetPage: async ({ page }, use) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    // Wait for the app to fully initialize (home page active)
    await page.waitForFunction(
      () => document.querySelector('#page-home.active') !== null,
      { timeout: 10_000 }
    );
    await use(page);
  },
});

export { expect };

/**
 * Helper: navigate to a specific page and wait for it to become active.
 */
export async function navigateToPage(page: Page, pageName: string) {
  await page.evaluate((p) => navigate(p), pageName);
  await page.waitForSelector(`#page-${pageName}.active`, { timeout: 5_000 });
}

/**
 * Helper: wait for the portal data to finish loading.
 */
export async function waitForPortalReady(page: Page) {
  await navigateToPage(page, 'portal');
  // Wait for balance to populate
  await page.waitForFunction(
    () => {
      const el = document.querySelector('#page-portal .billing-balance');
      return el && el.textContent && el.textContent !== '';
    },
    { timeout: 5_000 }
  );
}
