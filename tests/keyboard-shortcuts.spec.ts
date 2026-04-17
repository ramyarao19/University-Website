import { test, expect } from './fixtures/base.fixture';
import { BasePage } from './pages/base.page';

test.describe('Keyboard Shortcuts', () => {
  test('should open search overlay with Ctrl+K', async ({ resetPage }) => {
    const page = new BasePage(resetPage);
    await resetPage.keyboard.press('Control+k');
    await expect(page.searchOverlay).toHaveClass(/open/);
  });

  test('should open search overlay with Meta+K', async ({ resetPage }) => {
    const page = new BasePage(resetPage);
    await resetPage.keyboard.press('Meta+k');
    await expect(page.searchOverlay).toHaveClass(/open/);
  });

  test.describe('Escape Key Priority', () => {
    test('should close search overlay first when open', async ({ resetPage }) => {
      const page = new BasePage(resetPage);
      // Open search
      await page.openSearch();
      await expect(page.searchOverlay).toHaveClass(/open/);
      // Press Escape
      await page.pressEscape();
      await expect(page.searchOverlay).not.toHaveClass(/open/);
    });

    test('should close modal when search is not open', async ({ resetPage }) => {
      const page = new BasePage(resetPage);
      // Open modal via JS
      await resetPage.evaluate(() => openModal('Test', 'Test body', []));
      expect(await page.isModalOpen()).toBe(true);
      // Press Escape
      await page.pressEscape();
      expect(await page.isModalOpen()).toBe(false);
    });

    test('should close search before modal when both open', async ({ resetPage }) => {
      const page = new BasePage(resetPage);
      // Open modal first
      await resetPage.evaluate(() => openModal('Test', 'Test body', []));
      // Open search
      await page.openSearch();

      // First Escape closes search
      await page.pressEscape();
      await expect(page.searchOverlay).not.toHaveClass(/open/);
      // Modal should still be open
      expect(await page.isModalOpen()).toBe(true);

      // Second Escape closes modal
      await page.pressEscape();
      expect(await page.isModalOpen()).toBe(false);
    });

    test('should close search before mobile menu when both open', async ({ resetPage }) => {
      await resetPage.setViewportSize({ width: 390, height: 844 });
      await resetPage.reload();
      await resetPage.waitForFunction(
        () => document.querySelector('#page-home.active') !== null,
        { timeout: 10_000 }
      );
      const page = new BasePage(resetPage);
      // Open mobile menu
      await page.hamburgerBtn.click();
      await expect(page.mobileMenu).toHaveClass(/open/);
      // Open search
      await page.openSearch();

      // First Escape closes search (higher priority)
      await page.pressEscape();
      await expect(page.searchOverlay).not.toHaveClass(/open/);
      // Mobile menu should still be open
      await expect(page.mobileMenu).toHaveClass(/open/);

      // Second Escape closes mobile menu
      await page.pressEscape();
      await expect(page.mobileMenu).not.toHaveClass(/open/);
    });

    test('should close notification dropdown on Escape when nothing else is open', async ({ resetPage }) => {
      const page = new BasePage(resetPage);
      // Navigate to portal for notifications
      await page.navigateTo('portal');
      await resetPage.waitForFunction(
        () => {
          const el = document.querySelector('#page-portal .billing-balance');
          return el && el.textContent && /\$\d/.test(el.textContent);
        },
        { timeout: 10_000 }
      );
      // Open notification dropdown
      await resetPage.locator('#page-portal [onclick*="toggleNotifications"]').click();
      await resetPage.waitForFunction(
        () => document.querySelectorAll('.notif-dropdown .notif-item').length > 0,
        { timeout: 5_000 }
      );
      await resetPage.waitForTimeout(300);
      // Press Escape
      await page.pressEscape();
      await resetPage.waitForTimeout(200);
      // Dropdown should be closed
      const isOpen = await resetPage.locator('.notif-dropdown').first().evaluate(
        (el) => el.classList.contains('open')
      );
      expect(isOpen).toBe(false);
    });
  });

  test.describe('Additional Shortcuts', () => {
    test('should toggle search closed with Ctrl+K when already open', async ({ resetPage }) => {
      const page = new BasePage(resetPage);
      // Open search
      await page.openSearch();
      await expect(page.searchOverlay).toHaveClass(/open/);
      // Press Ctrl+K again — should toggle closed
      await resetPage.keyboard.press('Control+k');
      await expect(page.searchOverlay).not.toHaveClass(/open/);
    });

    test('should prevent default browser behavior on Ctrl+K', async ({ resetPage }) => {
      const page = new BasePage(resetPage);
      // Press Ctrl+K — should open search, not browser's address bar
      await resetPage.keyboard.press('Control+k');
      await expect(page.searchOverlay).toHaveClass(/open/);
    });
  });
});
